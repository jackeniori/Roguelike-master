import { Bag } from '../bag';
import {Button,MouseLeft,AbilitySort,AbilityPreviousNotice,KeyBindMove  } from '../button';
import { GameUnit } from '../libraries/unit/game_unit';
import { Test1 } from '../libraries/test';
import { PlayerData,createDefaultPlayerData } from '../libraries/player_data';
export class GameMode {
    players: {[key: number]: PlayerData}
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
        for (let i = 0; i <= count; i++) {
            this.players[i] = createDefaultPlayerData(i as PlayerID);
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
        }
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
    let playerdata = GameRules.Addon.players[PlayerID]
    if(event.value=='xianshi'){
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'xianshi'})
        hero.AddActivityModifier('juggernaut_blade_fury')
        hero.StartGesture(GameActivity.DOTA_CAST_ABILITY_2);
        Test1()
        print('xianshi')
    }else if(event.value=='ditu'){
        GameRules.Addon.players[PlayerID].grad_world = GradWorld(Vector(0,0,128),3,3,256,256)//origin
        //没有目标的特效附和在地面
    }else if(event.value=='jueseshuxing'){
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'jueseshuxing'})
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
        CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "test",{value: 'beibao'})
        playerdata.bag.Switch()
        //GameRules.Addon.players[PlayerID].bag.AddItem('item_abyssal_blade')
    }else if(event.value=='danweimianban'){
        const randomUnit = new GameUnit(
            hero, 
            "随机武者", 
            RandomInt(1,5)
        );
        const dantian = randomUnit.GetUnitData().dantian;
        CustomNetTables.SetTableValue("wu_xing", "player_" + PlayerID, {gridData: dantian.gridCells,initialRegion: dantian.initialRegion, switch: false});
    }
}



function shengchengwuxing(PlayerID:PlayerID){
    let wuxing = ("WuXingSystem.getAllTypes()")
    CustomGameEventManager.Send_ServerToPlayer<object>( PlayerResource.GetPlayer(PlayerID), "shengchengwuxing",{wuxing:wuxing})
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