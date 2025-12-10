
let KeyBind:Object = {a:'',s:'',d:'',w:''}
/*
    preinput  施法前瑶 和 施法后摇
    可格挡 闪避打断
    前摇后摇不可打断  
    前瑶不可打断
    后摇不可打断
    预输入


    按键后检测状态,释放 或者 预输入  preinput
*/
export function Button(this: void,userId: EntityIndex,event: {PlayerID: PlayerID;key:string,button:string,pos?:[number, number, number] }){
    const Key = event.key
    const Button = event.button
    const PlayerID = event.PlayerID
    const player = PlayerResource.GetPlayer(PlayerID)
    const hero = player.GetAssignedHero()
    const PlayerData = GameRules.Addon.players[tonumber(event.PlayerID)]
    PlayerData.Key = Key

    //按键后检测状态,释放 或者 预输入  preinput 
    //state.hero 0不可输入状态  1可输入状态  2 可移动
    if(PlayerData.state.hero  != false){
        //移动
        if(Key == 'a' || Key == 's' || Key == 'd' || Key == 'w'){
        }
        //格挡闪避
        if(Key == 'd' || Key == 'f'){ 
        }
        if(Key == 'd' || Key == 'f'){
            //格挡闪避时停止移动定时器 
            hero.StopThink('HeroMove'+PlayerID)
        }
            // if(PlayerData.preinput != 'AbilityCastPoint' && PlayerData.preinput != 'AbilityCastBackswing'){
            //     return
            // }
            if(Button == 'mouse_left'){
                //释放技能时停止移动定时器
                hero.StopThink('HeroMove'+PlayerID)
                let pos = Vector(event.pos['0'],event.pos['1'],event.pos['2'])
                dianliang(PlayerID,pos)
                //MouseLeft(hero,PlayerID,pos)
            }
            if(Key == 'f' &&  Button == 'down'){
                let ability = hero.FindAbilityByName('normal_block')
                if (ability.IsFullyCastable()){
                    hero.CastAbilityNoTarget(ability,PlayerID)
                }
            }else if(Key == 'space' && Button == 'down'){
                let pos = Vector(event.pos['0'],event.pos['1'],event.pos['2'])
                let ability = hero.FindAbilityByName('normal_dodge')
                if (ability.IsFullyCastable()){
                    const direction = ((pos - hero.GetAbsOrigin()) as Vector).Normalized();
                    hero.SetForwardVector(direction)
                    hero.CastAbilityOnPosition(pos,ability,PlayerID)
                }
            }else{
                KeyBindMove(PlayerID,hero,Key,Button)
            }
    }

}

function dianliang(PlayerID,pos){
    const PlayerData = GameRules.Addon.players[tonumber(PlayerID)]
    const texiao:Vector = FindNearestTileByPosition(PlayerID,pos)
    if(PlayerData.state.grid){
        ParticleManager.DestroyParticle(PlayerData.state.grid, false)
        ParticleManager.ReleaseParticleIndex(PlayerData.state.grid)
        PlayerData.state.grid = undefined;
    }
    if(texiao){
        const particle = ParticleManager.CreateParticle(
            "particles/lianjin/hexagon.vpcf", // 粒子资源路径
            ParticleAttachment.WORLDORIGIN,      // 粒子附加到世界坐标
            undefined                            // 其他参数（未使用）
        );
        ParticleManager.SetParticleControl(particle, 0, texiao);
        PlayerData.state.grid = particle;
    }
}

//根据指定位置查找最近的地块
function FindNearestTileByPosition(PlayerID:PlayerID,pos:Vector):Vector{
    let gradWorld = GameRules.Addon.players[PlayerID].grad_world
	let origin = gradWorld.origin
    let cellSize = gradWorld.width
    let roughY = Math.round((pos.y - origin.y) / cellSize / 0.75)
    let roughX = Math.round((pos.x - origin.x) / cellSize) 
    let oddRaw = roughY%2 == 1;
    // 定义邻居方向
    const directions = [
        { dx: 0, dy: 0 }, 
        { dx: 0, dy: -1 }, 
        { dx: oddRaw ? +1 : -1, dy: -1 }, 
        { dx: -1, dy: 0 }, 
        { dx: +1, dy: 0 }, 
        { dx: 0, dy: +1 }, 
        { dx: oddRaw ? +1 : -1, dy: +1 }, 
    ];
    // 生成邻居坐标列表
    let neighbourXYList:Vector[]=[];
    directions.forEach(({ dx, dy }) => {
        const neighborX = roughX + dx;
        const neighborY = roughY + dy;
        const result = gradWorld.vector[neighborX]?.[neighborY];
        if (result) {
            neighbourXYList.push(result);
        }
    });
     // 如果没有邻居，直接返回
    if (neighbourXYList.length === 0) return;
    // 查找最近的邻居
    let closestXY:Vector = neighbourXYList.reduce((closest, current) => {
        return (pos - current as Vector).Length() < (pos - closest as Vector).Length() ? current : closest;
    });
    // 计算到最近邻居的距离
    const distanceToClosest = (pos - closestXY as Vector).Length();
    if (distanceToClosest > cellSize / 2) {
        return;
    }
    return  Vector(closestXY.x,closestXY.y,130)
}

/**
  鼠标左键释放技能
  技能分为  可打断前瑶  可打断后摇  不可打断前瑶 不可打断后摇
  全写技能KV
 * @param hero 
 * @param PlayerID 
 * @param pos 
 * @returns 
 * AbilityCastPoint  施法前摇
 */

export function MouseLeft(hero:CDOTA_BaseNPC_Hero,PlayerID:PlayerID,pos:Vector){
    const PlayerData = GameRules.Addon.players[PlayerID]
    PlayerData.state.hero  = false
    // 防止重复触发
    if (PlayerData.hero['PreviousNotice'] !== 0) return;
    // 获取当前技能名称
    const AbilityName = PlayerData.Ability[PlayerData.Ability['now']];
    const ability: CDOTABaseAbility = hero.FindAbilityByName(AbilityName);
     // 标记技能释放开始
    PlayerData.hero['PreviousNotice'] = 1
    // 计算技能释放延迟（包含施法时间和 1 秒冷却）
    const  CastTime = ability.GetAbilityKeyValues()['CastTime'] || 0;
    // 更新英雄状态为非空闲状态
    hero.SetContextThink('state.hero',function(){
        PlayerData.state.hero  = true
        return null
    },1+CastTime)

    if (ability.IsFullyCastable()) {
        // 计算移动方向
        const direction = (pos - hero.GetAbsOrigin() as Vector).Normalized();
        // 调整英雄面向
        hero.SetForwardVector(direction);
        // 设置技能释放逻辑
        hero.SetContextThink('MouseLeft', () => {
            // 释放技能
            hero.CastAbilityOnPosition(pos, ability, PlayerID);
            // 更新技能顺序
            AbilitySort(PlayerID);
            return null;
        }, 0.03);
    }
}
// 定义技能释放顺序的映射表
export function AbilitySort(PlayerID: PlayerID) {
    // 获取当前玩家对象
    const player = PlayerResource.GetPlayer(PlayerID);
    // 获取玩家数据对象
    const PlayerData = GameRules.Addon.players[PlayerID];
    // 技能释放顺序映射表（普通循环顺序）
    const skillOrderMap: Record<string, string> = {
        '1': '2',  // 当前技能为 '1' 时，下一次释放 '2'
        '2': '3',  // 当前技能为 '2' 时，下一次释放 '3'
        '3': '1',  // 当前技能为 '3' 时，下一次释放 '1'
        '4': '5',  // 当前技能为 '4' 时，下一次释放 '5'
        '5': '6',  // 当前技能为 '5' 时，下一次释放 '6'
        '6': '4',  // 当前技能为 '6' 时，下一次释放 '4'
        '7': '8',  // 当前技能为 '7' 时，下一次释放 '8'
        '8': '9',  // 当前技能为 '8' 时，下一次释放 '9'
        '9': '7',  // 当前技能为 '9' 时，下一次释放 '7'
    };
    // 获取当前技能编号
    const currentSkill = PlayerData.Ability['now'];
    // 根据技能顺序映射表更新当前技能编号
    PlayerData.Ability['now'] = skillOrderMap[currentSkill];
    // 特殊技能跳转映射表（用于连招重置）
    const nextSkillMap: Record<string, string> = {
        '2': '1',  // 当前技能为 '2' 或 '3' 时，跳转到 '1'
        '3': '1',
        '5': '4',  // 当前技能为 '5' 或 '6' 时，跳转到 '4'
        '6': '4',
        '8': '7',  // 当前技能为 '8' 或 '9' 时，跳转到 '7'
        '9': '7',
    };
    // 设置连招重置时间（1秒后触发）
    player.SetContextThink('AbilitySort' + PlayerID, () => {
        // 如果当前技能不在特殊组中，则直接跳转到下一个技能
        if (currentSkill !== '1' && currentSkill !== '4' && currentSkill !== '7') {
            // 根据特殊技能跳转映射表更新当前技能编号
            PlayerData.Ability['now'] = nextSkillMap[currentSkill] || currentSkill;
        }
        return null;  // 返回 null 表示任务结束
    }, 1);  // 1 秒后执行连招重置逻辑
}

//施法后摇  后摇结束前无法继续释放攻击技能
export function AbilityPreviousNotice(PlayerID:PlayerID,time:number){
    const player = PlayerResource.GetPlayer(PlayerID)
    const PlayerData = GameRules.Addon.players[PlayerID]
    player.SetContextThink('AbilityPreviousNotice'+PlayerID,function(){
        PlayerData.hero['PreviousNotice'] = 0;
        return null
    },time)
}

export function KeyBindMove(PlayerID:PlayerID,hero:CDOTA_BaseNPC_Hero,Key:string,Button:string){
    let KeyOn = [] 
    if(Button == 'down'){
        if(KeyBind[Key] != Key){ KeyBind[Key] = Key}
    }else{
        if(KeyBind[Key] == Key){ KeyBind[Key] = ''}
    }
    for(let Key in KeyBind){
        if(KeyBind[Key] != ''){
            KeyOn.push(KeyBind[Key])
        }
    }
    //w  X+  s X-  d  Y+  a  Y-

    let point = Direction(KeyOn)
    hero.SetContextThink('HeroMove'+PlayerID,function(){
        if(KeyOn.length == 0){
            hero.Stop()
            return null
        }
        hero.MoveToPosition((hero.GetOrigin()+point) as Vector)
        return 0.1
    },0.03)
}
function Direction(KeyOn:string[]){
    if(KeyOn.length > 3){
        return Vector(0,0,0)
    }
    let x:number = 0;
    let y:number = 0;
    let num:number
    for(num=KeyOn.length; num >= 0; num--){
        if(KeyOn[num] == 'w'){
            y = y +50
        }else if(KeyOn[num] == 's'){
            y = y -50
        }
        else if(KeyOn[num] == 'd'){
            x = x +50
        }
        else if(KeyOn[num] == 'a'){
            x = x -50
        }
    } 
    return Vector(x,y,0)
}