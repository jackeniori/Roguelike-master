import {Button,MouseLeft,AbilitySort,AbilityPreviousNotice,KeyBindMove  } from '../libraries/button';
import { Bag } from '../libraries/bag';
declare global {
    interface CDOTAPlayerController{
        IsFirstSpawnEntity:CDOTA_BaseNPC;
    }
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}  

export class GameConfig {
    constructor() {
        SendToServerConsole('dota_max_physical_items_purchase_limit 9999'); // 用来解决物品数量限制问题
        GameRules.SetHeroSelectionTime(1) // 设置选择英雄时间
        GameRules.SetStrategyTime(1) // 设置决策时间
        GameRules.SetShowcaseTime(1) // 设置展示时间
        GameRules.SetPreGameTime(1) //设置游戏准备时间
        GameRules.SetCustomGameSetupAutoLaunchDelay(0) //设置等待自动启动的时间。
        GameRules.GetGameModeEntity().SetFogOfWarDisabled(true)  //关闭战争迷雾
        GameRules.GetGameModeEntity().SetFixedRespawnTime(99999)   //设置英雄重生时间
        GameRules.GetGameModeEntity().SetCustomGameForceHero("npc_dota_hero_rubick")  //      npc_dota_hero_juggernaut
    }
}

export class GameMode {
    players: {[key: number]: {
        IsFirstSpawnEntity: CDOTA_BaseNPC | null;
        Ability: { [key: string]: string };
        hero:{ PreviousNotice: number };
        bag;
        preinput: string;
        weapon: number;
        Key: string;
        state: {
            hero: boolean;
            grid:ParticleID;
        };
        grad_world:{
            x:number,
            y:number,
            width:number,
            height:number,
            origin:Vector,
            particle:{ [key: number] : ParticleID},
            vector: { [key: number] : { [key: number]: Vector } }
        };
    }}
    // public static Precache(this: void, context: CScriptPrecacheContext) {
    //     PrecacheResource("particle", "particles/econ/items/keeper_of_the_light/kotl_ti10_immortal/kotl_ti10_blinding_light.vpcf", context);
    //     PrecacheResource("particle", "particles/hero_mars/mars_shield_bash.vpcf", context);
    //     PrecacheResource("particle", "particles/hero_mars/mars_shield_bash_test.vpcf", context);
    //     PrecacheResource("particle", "particles/test.vpcf", context);
    //     PrecacheResource("particle", "particles/test/banyuezhan.vpcf", context);
    //     PrecacheResource("particle", "particles/riki_attack.vpcf", context);
    //     PrecacheResource("particle", "particles/yanjiangliubianxing.vpcf", context);  //地形
    //     PrecacheResource("particle", "particles/hero_mars/mars_shield_bash_full_circle.vpcf", context);
    //     //PrecacheResource("particle", "", context);
    // }


    constructor() {
        //  注册监听事件
        CustomGameEventManager.RegisterListener( "test", Test )  
        CustomGameEventManager.RegisterListener( "master", Master )  
        //监听事件 
        ListenToGameEvent("npc_spawned", keys => this.OnNpcSpawned(keys), undefined);
        CustomGameEventManager.RegisterListener<{PlayerID: PlayerID;key:string,button:string,pos?:[number, number, number] }>( "Button", Button )  
        //初始化
        const count:number = PlayerResource.GetPlayerCount()
        this.players = {}
        for(let i=0;i<=count;i++){
            this.players[i] = {
                IsFirstSpawnEntity:null,
                Ability:{},
                hero:{PreviousNotice:0},
                bag:new Bag('player_'+i,PlayerResource.GetPlayer(i as PlayerID),36,1,36),
                preinput:'',
                weapon:1,
                Key:'',
                state:{
                    hero:true,
                    grid:null,
                },
                grad_world:{x:0,y:0,width:0,height:0,origin:Vector(0,0,128),particle:[],vector:[]}
            }
        }
    }
    private OnNpcSpawned(keys: NpcSpawnedEvent) {
        const unit = EntIndexToHScript(keys.entindex) as CDOTA_BaseNPC; 
        const PlayerID:PlayerID = unit.GetPlayerOwnerID()
        const PlayerData = this.players[PlayerID]
        if(PlayerData == null){return}
        const player:CDOTAPlayerController = PlayerResource.GetPlayer(PlayerID)
        if (unit.UnitCanRespawn() && PlayerID != -1 && PlayerData.IsFirstSpawnEntity == null) {
            PlayerData.IsFirstSpawnEntity = unit
            this.HeroInit(unit,PlayerID)
        }
    }
    
// 初始化英雄技能
    private HeroInit(unit: CDOTA_BaseNPC, PlayerID: PlayerID): void {
    print('chushihuayingxiong')
    const PlayerData = this.players[PlayerID];
    // 定义技能映射
    // PlayerData.Ability = {
    //     '1': 'normal_test',
    //     '2': 'dagger_2',
    //     '3': 'dagger_3',
    //     '4': 'dagger_4',
    //     '5': 'dagger_5',
    //     '6': 'dagger_6',
    //     '7': 'dagger_7',
    //     '8': 'dagger_8',
    //     '9': 'dagger_9',
    //     'dodge': 'normal_dodge',
    //     'block': 'normal_block',
    //     'now': '1', // 当前默认技能索引
    // },
    //     // 添加基础技能
    //     ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'dodge', 'block'].forEach(skillKey => {
    //         const AbilityName = this.players[PlayerID]?.Ability[skillKey];
    //         if (AbilityName) {
    //             print('jinengming',AbilityName)
    //             const ability = unit.AddAbility(AbilityName);
    //             ability?.SetLevel(1); // 设置技能等级为1
    //         }
    //     });
    const ability = unit.AddAbility('shredder_reactive_armor');
    ability.SetLevel(1)
    const ability1 = unit.AddAbility("shredder_whirling_death");
    ability1.SetLevel(1)
    const ability2 = unit.AddAbility("mirana_leap");
    ability2.SetLevel(1)
    const ability3 = unit.AddAbility("viper_poison_attack");
    ability3.SetLevel(1)
    
    }
}

function Master(this: void,userId: EntityIndex, event: {
    PlayerID: PlayerID;
    entityindex:EntityIndex
}){
    let PlayerID = event.PlayerID
    let hero:CDOTA_BaseNPC = EntIndexToHScript(event.entityindex) as CDOTA_BaseNPC
    if(hero.IsHero()){
        let BaseStr  = hero.GetBaseStrength()
        let BaseAgi  = hero.GetBaseAgility()
        let BaseInt  = hero.GetBaseIntellect()
        let str = hero.GetStrength()
        let agi = hero.GetAgility()
        let int = hero.GetIntellect(true)
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "master",{str:str,agi:agi,int:int,BaseStr:BaseStr,BaseAgi:BaseAgi,BaseInt:BaseInt})
    } 
}

let CreateUnit = 0
function Test(this: void,userId: EntityIndex, event: {
    PlayerID: PlayerID;
    value:string
}){
    let PlayerID = event.PlayerID
    let player = PlayerResource.GetPlayer(PlayerID)
    let hero = player.GetAssignedHero()
    let origin = Vector(hero.GetOrigin().x +300,hero.GetOrigin().y,hero.GetOrigin().z)
    if(event.value=='xianshi'){
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'xianshi'})
        hero.AddActivityModifier('juggernaut_blade_fury')
        hero.StartGesture(GameActivity.DOTA_CAST_ABILITY_2);
    }else if(event.value=='ditu'){
        GameRules.Addon.players[PlayerID].grad_world = GradWorld(Vector(0,0,128),3,3,256,256)//origin
        print('chuangjianditu')
        //没有目标的特效附和在地面
    }else if(event.value=='yincang'){
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'yincang'})
    }else if(event.value=='duiyou'){
            CreateUnitByName('npc_dota_hero_abaddon', origin, true, null, null, 2)
    }else if(event.value=='diren'){
        CreateUnitByName('npc_dota_hero_abaddon', origin, true, null, null, 4)  
    }else if(event.value=='shengji'){
        hero.HeroLevelUp(true)
    }else if(event.value=='shanchuditu'){
        RemoveGradWorld(PlayerID)
    }else if(event.value=='beibao'){
        //CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'beibao'})
        GameRules.Addon.players[PlayerID].bag.Switch()
        GameRules.Addon.players[PlayerID].bag.AddItem('item_abyssal_blade')
    }
}
//原点,玩家,列,竖,宽,高
function GradWorld(origin:Vector,x:number,y:number,width:number,height:number){
    let gradX:number;
    let gradY:number;

    let grad_world:{
        x:number,y:number,width:number,height:number,origin:Vector,
        particle:{ [key: number] : ParticleID},
        vector: { [key: number] : { [key: number]: Vector } }
    };
    grad_world = {x:x,y:y,width:width,height:height,origin:origin,particle:[],vector:[]}
    let Gparticle:ParticleID[]= []
    let Gvector: { [key: number] : { [key: number]: Vector } } = {}
    for (let i = 0; i <= x; i++) {
        Gvector[i] = [];
    }

    for(let i=0;i<=x;i++){
        for(let j=0;j<=y;j++){
            const particle = ParticleManager.CreateParticle(
                "particles/yanjiangliubianxing.vpcf", // 粒子资源路径
                ParticleAttachment.WORLDORIGIN,      // 粒子附加到世界坐标
                undefined                            // 其他参数（未使用）
            );
        // 计算粒子的水平偏移量
        const gradX = i * width + (j % 2 === 1 ? width / 2 : 0); // 如果 j 是奇数，则偏移半个宽度
        // 计算粒子的垂直偏移量
        const gradY = j * height * 3 / 4; // 垂直方向按 3/4 的高度步进
        // 构造粒子的世界坐标
        const point = Vector(origin.x + gradX, origin.y + gradY, 128); // z 轴固定为 128
        // 将粒子位置存储到二维数组中
        Gvector[i][j] = point;   
        // 设置粒子的位置 存储到全局粒子列表中
        ParticleManager.SetParticleControl(particle, 0, point);
        Gparticle.push(particle);
        //print(i,j,Gvector[i][j])
        }
    }
    grad_world.particle = Gparticle
    grad_world.vector = Gvector
    return grad_world
}
function RemoveGradWorld(PlayerID:PlayerID){
    let Gparticle = GameRules.Addon.players[PlayerID].grad_world.particle
    for(let nFXIndex in Gparticle){
        ParticleManager.DestroyParticle(Gparticle[nFXIndex], false)
        ParticleManager.ReleaseParticleIndex(Gparticle[nFXIndex])
    }
    GameRules.Addon.players[PlayerID].grad_world = {x:0,y:0,width:0,height:0,origin:Vector(0,0,128),particle:[],vector:[]}
}

// function UseAbility(PlayerID:PlayerID,heroIndex:EntityIndex,AbilityName:string){
//     CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "UseAbility",{heroIndex:heroIndex,AbilityName:AbilityName})
// }
// UseAbility(PlayerID,heroIndex,'normal_block')


        // GameRules.SetCustomGameSetupAutoLaunchDelay(3); // 游戏设置时间（默认的游戏设置是最开始的队伍分配）
        // GameRules.SetCustomGameSetupRemainingTime(3); // 游戏设置剩余时间
        // GameRules.SetCustomGameSetupTimeout(3); // 游戏设置阶段超时
        // GameRules.SetHeroSelectionTime(0); // 选择英雄阶段的持续时间
        // GameRules.SetShowcaseTime(0); // 选完英雄的展示时间
        // GameRules.SetPreGameTime(0); // 进入游戏后号角吹响前的准备时间
        // GameRules.SetPostGameTime(30); // 游戏结束后时长
        // GameRules.SetSameHeroSelectionEnabled(true); // 是否允许选择相同英雄
        // GameRules.SetStartingGold(0); // 设置初始金钱
        // GameRules.SetGoldTickTime(0); // 设置工资发放间隔
        // GameRules.SetGoldPerTick(0); // 设置工资发放数额
        // GameRules.SetHeroRespawnEnabled(false); // 是否允许英雄重生
        // GameRules.SetCustomGameAllowMusicAtGameStart(false); // 是否允许游戏开始时的音乐
        // GameRules.SetCustomGameAllowHeroPickMusic(false); // 是否允许英雄选择阶段的音乐
        // GameRules.SetCustomGameAllowBattleMusic(false); // 是否允许战斗阶段音乐
        // GameRules.SetUseUniversalShopMode(true); // 是否启用全地图商店模式（在基地也可以购买神秘商店的物品）* 这个不是设置在任何地方都可以购买，如果要设置这个，需要将购买区域覆盖全地图
        // GameRules.SetHideKillMessageHeaders(true); // 是否隐藏顶部的英雄击杀信息

        // const game: CDOTABaseGameMode = GameRules.GetGameModeEntity();
        // game.SetRemoveIllusionsOnDeath(true); // 是否在英雄死亡的时候移除幻象
        // game.SetSelectionGoldPenaltyEnabled(false); // 是否启用选择英雄时的金钱惩罚（超时每秒扣钱）
        // game.SetLoseGoldOnDeath(false); // 是否在英雄死亡时扣除金钱
        // game.SetBuybackEnabled(false); // 是否允许买活
        // game.SetDaynightCycleDisabled(true); // 是否禁用白天黑夜循环
        // game.SetForceRightClickAttackDisabled(true); // 是否禁用右键攻击
        // game.SetHudCombatEventsDisabled(true); // 是否禁用战斗事件（左下角的战斗消息）
        // game.SetCustomGameForceHero(`npc_dota_hero_phoenix`); // 设置强制英雄（会直接跳过英雄选择阶段并直接为所有玩家选择这个英雄）
        // game.SetUseCustomHeroLevels(true); // 是否启用自定义英雄等级
        // game.SetCustomHeroMaxLevel(1); // 设置自定义英雄最大等级
        // game.SetCustomXPRequiredToReachNextLevel({
        //     // 设置自定义英雄每个等级所需经验，这里的经验是升级到这一级所需要的*总经验）
        //     1: 0,
        // });
        // game.SetDaynightCycleDisabled(true); // 是否禁用白天黑夜循环
        // game.SetDeathOverlayDisabled(true); // 是否禁用死亡遮罩（灰色的遮罩）

        // 设置自定义的队伍人数上限，这里的设置是10个队伍，每个队伍1人
        // GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 1);
        // GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 1);
        // for (let team = DotaTeam.CUSTOM_1; team <= DotaTeam.CUSTOM_8; ++team) {
        //     GameRules.SetCustomGameTeamMaxPlayers(team, 1);
        // }