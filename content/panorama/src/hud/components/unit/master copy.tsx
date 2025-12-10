import { render } from 'react-panorama-x';
import React, { useState,useEffect,useRef } from "react";
import classNames from 'classnames';
import {DOTAAbilityList,DOTAInventoryPanel} from './ability_panel';
let isInAttackingBoss = false;
let entityindex:EntityIndex | -1 = -1
let m_AbilityPanels:AbilityEntityIndex[] = [];
let m_InventoryPanels:ItemEntityIndex[] = [];
export function Master() {
    const [MiddlePanel,setMiddlePanel] = useState<Partial<VCSSStyleDeclaration>>({width:'321px'})
    const [abilityPanels, setAbilityPanels] = useState<AbilityEntityIndex[]>([]);
	useEffect(() => {
        let update = () => {
            if(entityindex != -1){
                m_AbilityPanels = []
                for ( let i = 0; i < Entities.GetAbilityCount( entityindex ); ++i )
                {
                    let ability:AbilityEntityIndex = Entities.GetAbility( entityindex, i );
                    if ( ability != -1 && Abilities.IsDisplayedAbility(ability) )
                    {
                        m_AbilityPanels.push(ability)
                    }
                }  
                if(m_AbilityPanels.length >= 5){
                    setMiddlePanel({width: m_AbilityPanels.length*80+'px'})
                }
                for ( var i = 0; i < 12; ++i )
                {
                    m_InventoryPanels[i] = Entities.GetItemInSlot( entityindex, i );
                }
                setAbilityPanels(m_AbilityPanels)
            }
        }
		let iScheduleHandle:any;
		let think = () => {
			iScheduleHandle = $.Schedule(0.1, think)
			update();
		}
		think();
    return () => {
        $.CancelScheduled(iScheduleHandle);
    } },[]);
    return  <Panel hittest={false} className={classNames({ "root":true, "visible": entityindex != -1 })} > 
            <Panel id='UnitPanel' hittest={false} >
                <LeftPanel/>
                <Panel id={"MiddlePanel"} style={MiddlePanel} hittest={false}>
                        <Panel id="MiddlePanelBackgroundImage" hittest={false}/>
                        <Panel id="AbilitiesAndStatBranch" hittest={false}>
                            {/* 天赋树 */}
                            <Panel id='DOTAHudTalentDisplay' className="StatBranch" />
                            {/* 天赋树 */}
                            {/* 技能 */}
                            <DOTAAbilityList entityindex = {entityindex} AbilityPanels={m_AbilityPanels}/>
                            {/* 技能 */}
                            {/* 阿哈利姆 */}
                            <Panel id='DOTAAghsStatusDisplay' className="AghsStatusContainer" />
                            {/* 阿哈利姆 */}
						</Panel>
                    <Panel id="MiddleFlowChildren" hittest={false}>
                        {/* 魔法和生命条 */}
                        <HealthManaContainer/>
                        {/* 魔法和生命条 */}
                    </Panel>
                    <Panel className="AbilityInsetShadowRight"  hittest={false}/>
                </Panel>
                <Panel id='RightPanel' hittest={false}>
                    <InventoryListPanel entityindex = {entityindex}  InventoryPanels={m_InventoryPanels} />
                </Panel>
                
            </Panel>
        </Panel>
}

/* 魔法和生命条 */
function HealthManaContainer(){
	//魔法和生命条
    let [Mana,setMana] = useState<string>('1')
    let [ManaRegen,setManaRegen] = useState<number | string>(1)
    let [ManaProgress,setManaProgress] = useState<string>('100%')
    let [Health,setHealth] = useState<string>('1')
    let [HealthRegen,setHealthRegen] = useState<number | string>(1)
    let [HealthProgress,setHealthProgress] = useState<string>('100%')
	useEffect(() => {
        let update = () => {
            if(entityindex != -1){
                setMana(Entities.GetMana(entityindex).toString()+' / '+Entities.GetMaxMana(entityindex).toString())
                setManaProgress((Entities.GetMana(entityindex)/Entities.GetMaxMana(entityindex)*100).toString()+'%')
                setManaRegen('+'+Entities.GetManaThinkRegen(entityindex).toFixed(1))
                setHealth(Entities.GetHealth(entityindex).toString()+' / '+Entities.GetMaxHealth(entityindex).toString())
                setHealthProgress((Entities.GetHealth(entityindex)/Entities.GetMaxHealth(entityindex)*100).toString()+'%')
                setHealthRegen('+'+Entities.GetHealthThinkRegen(entityindex).toFixed(1))
            }
        }
		let iScheduleHandle:any;
		let think = () => {
			iScheduleHandle = $.Schedule(0.1, think)
			update();
		}
		think();
    return () => {
        $.CancelScheduled(iScheduleHandle);
    } },[]);
    return  <Panel id="HealthManaContainer" hittest={false}>
        <Panel id="HealthContainer" hittest={false}>
            <Label id="HealthLabel" className="MonoNumbersFont" text={Health} hittest={false} />
            <ProgressBar id="HealthProgress">
                <Panel id="HealthProgress_Left" style={{width:HealthProgress}} className="ProgressBarLeft">
                    <Panel className="DotaSceneContainer">
                        <DOTAScenePanel id="HealthBurner" map="scenes/hud/healthbarburner" renderdeferred={false} rendershadows={false} camera="camera_1" hittest={false} particleonly={true} />
                    </Panel>
                </Panel>
            </ProgressBar>
            <Label id="HealthRegenLabel" className="MonoNumbersFont" text={HealthRegen} hittest={false} />
        </Panel>
        <Panel id="ManaContainer" hittest={false}>
            <Label id="ManaLabel" className="MonoNumbersFont" text={Mana} hittest={false} />
            <ProgressBar id="ManaProgress" >
                <Panel id="ManaProgress_Left" style={{width:ManaProgress}} className="ProgressBarLeft">
                    <Panel className="DotaSceneContainer">
                        <DOTAScenePanel id="ManaBurner" map="scenes/hud/healthbarburner" renderdeferred={false} rendershadows={false} camera="camera_1" hittest={false} particleonly={true} />
                    </Panel>
                </Panel>
            </ProgressBar>
            <Label id="ManaRegenLabel" className="MonoNumbersFont" text={ManaRegen} hittest={false} />
        </Panel>
    </Panel>
}
//左边部分 头像 基础属性  力智敏  经验值
function LeftPanel(){
    let iAbilityIndex:AbilityEntityIndex;
    let [Unit,setUnit] = useState<string>()
    let [CircularXPProgress,setCircularXPProgress] = useState<string>('radial( 50.0% 50.0%, 0.0deg, 0.0deg)')
    //经验值
    let [XP,setXP] = useState<string>('0/0')
    let [Level,setLevel] = useState<number>(1)
    //基础属性
    let[DamageBase,setDamageBase] = useState<number>(1)
    let[DamageLabelModifier,setDamageLabelModifier] = useState<string | number>('')
    let[DamageLabelModifierStyle,setDamageLabelModifierStyle] = useState<Partial<VCSSStyleDeclaration>>({})
    
    let[AttackSpeedLabelBase,setAttackSpeedLabelBase] = useState<string | number>('')

    let[ArmorLabelBase,setArmorLabelBase] = useState<string | number>('')
    let[ArmorLabelModifier,setArmorLabelModifier] = useState<string | number>('')
    let[ArmorLabelModifierStyle,setArmorLabelModifierStyle] = useState<Partial<VCSSStyleDeclaration>>({})

    let[MagicResistLabelBase,setMagicResistLabelBase] = useState<string | number>('%')
    let[MagicResistStyle,setMagicResistStyle] = useState<Partial<VCSSStyleDeclaration>>({})

    let[MoveSpeedLabelBase,setMoveSpeedLabelBase] = useState<string | number>('')
    //力智敏
    let[Strength,setStrength] = useState<string | number>('')
    let[StrengthModifier,setStrengthModifier] = useState<string | number>('')
    
    let[Agility,setAgility] = useState<string | number>('')
    let[AgilityModifier,setAgilityModifier] = useState<string | number>('')
    
    let[Intelligence,setIntelligence] = useState<string | number>('')
    let[IntelligenceModifier,setIntelligenceModifier] = useState<string | number>('')
    let str:number,agi:number,int:number,BaseStr:number,BaseAgi:number,BaseInt:number

    let[StrengthStyle,setStrengthStyle] = useState<Partial<VCSSStyleDeclaration>>({})
    let[StrengthModifierStyle,setStrengthModifierStyle] = useState<Partial<VCSSStyleDeclaration>>({})
    let[IntelligenceStyle,setIntelligenceStyle] = useState<Partial<VCSSStyleDeclaration>>({})
    let[IntelligenceModifierStyle,setIntelligenceModifierStyle] = useState<Partial<VCSSStyleDeclaration>>({})
    let[AgilityStyle,setAgilityStyle] = useState<Partial<VCSSStyleDeclaration>>({})
    let[AgilityModifierStyle,setAgilityModifierStyle] = useState<Partial<VCSSStyleDeclaration>>({})

    let[MiddlePanel,setMiddlePanel] = useState<Partial<VCSSStyleDeclaration>>({width:'321px'})

	useEffect(() => {
        let update = () => {
            if(entityindex != -1){
                //经验值
                setUnit(Entities.GetUnitName(entityindex))
                let UPXP = Entities.GetCurrentXP(entityindex);let UPMAXXP = Entities.GetNeededXPToLevel(entityindex)
                if(GameUI.IsAltDown()){setXP(UPXP +' / '+ UPMAXXP)}else{setXP('')}
                setLevel(Entities.GetLevel(entityindex))
                setCircularXPProgress('radial( 50.0% 50.0%, 0.0deg, '+ (360/(UPMAXXP/UPXP)).toFixed(1) +'deg)')
                //基础属性
                let Damagetxt = (Entities.GetDamageMax(entityindex)+Entities.GetDamageMin(entityindex))/2
                let DamageBonustxt = Entities.GetDamageBonus( entityindex )
                
                if(DamageBonustxt == 0 ){
                    setDamageBase(Damagetxt)
                    setDamageLabelModifier('')
                }else if(DamageBonustxt < 0){
                    setDamageBase(Damagetxt)
                    setDamageLabelModifier(DamageBonustxt)
                    setDamageLabelModifierStyle({color:'#FF3300'})
                }else if(DamageBonustxt > 0){
                    setDamageBase(Damagetxt)
                    setDamageLabelModifier('+'+DamageBonustxt)
                    setDamageLabelModifierStyle({color:'#45DD3B'})
                }
                setAttackSpeedLabelBase(Math.floor((Entities.GetAttackSpeed(entityindex)*100)))

                let ArmorBonus = Entities.GetBonusPhysicalArmor(entityindex)
                let Armor = Entities.GetPhysicalArmorValue(entityindex)
                if(GameUI.IsAltDown()){
                    //护甲百分比 
                    let hujia1= 0.052*Armor
                    let hujia2 = 0.9+Math.abs(0.048*Armor)
                    if(Armor >= 0 ){
                        setArmorLabelBase(Math.floor(hujia1/hujia2*100)+'%')
                    }else{
                        setArmorLabelBase(Math.ceil(hujia1/hujia2*100)+'%')
                    }
                    setArmorLabelModifier("")
                }
                else{
                    if(ArmorBonus == 0){
                        setArmorLabelBase(Math.floor(Armor))
                        setArmorLabelModifier("")
                    }else if(ArmorBonus < 0){
                        setArmorLabelBase(Math.floor((Armor-ArmorBonus)))
                        setArmorLabelModifier(ArmorBonus)
                        setArmorLabelModifierStyle({color: "#FF3300"})
                    } else{
                        setArmorLabelBase(Math.floor((Armor-ArmorBonus)))
                        setArmorLabelModifier('+'+ArmorBonus)
                        setArmorLabelModifierStyle({color: "#45DD3B"})
                    }
                }
                let MagicResist = Math.floor(Entities.GetMagicalArmorValue(entityindex)*100)
                if(MagicResist>= 0){
                    setMagicResistLabelBase(MagicResist+'%')
                    setMagicResistStyle({color: "#ccc"})
                }else{
                    setMagicResistLabelBase(MagicResist+'%')
                    setMagicResistStyle({color: "#FF3300"})
                }
                setMoveSpeedLabelBase(	Math.floor(Entities.GetMoveSpeedModifier(entityindex,Entities.GetBaseMoveSpeed( entityindex )))   )
                //力智敏
                if(!GameUI.IsAltDown()){
                    setStrength(str)
                    setStrengthModifier("")
                    setAgility(agi)
                    setAgilityModifier("")
                    setIntelligence(int)
                    setIntelligenceModifier("")
                    setStrengthStyle({fontSize: '18px',marginRight:' 2px'})
                    setStrengthModifierStyle({fontSize: '0px'})
                    setIntelligenceStyle({fontSize: '18px',marginRight:' 2px'})
                    setIntelligenceModifierStyle({fontSize: '0px'})
                    setAgilityStyle({fontSize: '18px',marginRight:' 2px'})
                    setAgilityModifierStyle({fontSize: '0px'})
                }else{
                    setStrength(BaseStr)
                    if(str-BaseStr == 0){
                        setStrengthModifier("")
                    }else{
                        setStrengthModifier('+'+(str-BaseStr))
                    }
                    setAgility(BaseAgi)
                    if(agi-BaseAgi == 0){
                        setAgilityModifier("")
                    }else{
                        setAgilityModifier('+'+(agi-BaseAgi))
                    }
                    setIntelligence(BaseInt)
                    if(str-BaseStr == 0){
                        setIntelligenceModifier("")
                    }else{
                        setIntelligenceModifier('+'+(int-BaseInt))
                    }
                    setStrengthStyle({fontSize: '12px',marginRight:' 0px'})
                    setStrengthModifierStyle({fontSize: '12px'})
                    setIntelligenceStyle({fontSize: '12px',marginRight:' 0px'})
                    setIntelligenceModifierStyle({fontSize: '12px'})
                    setAgilityStyle({fontSize: '12px',marginRight:' 0px'})
                    setAgilityModifierStyle({fontSize: '12px'})
                } 
            }
        }

		let iScheduleHandle:any;
		let think = () => {
			iScheduleHandle = $.Schedule(0.1, think)
			update();
		}
		think();
        let listener1:any,listener2:any,listener3:any,listener4:any,listener5:any,listener6:any,listener7:any,listener8:any,listener9:any,listener10:any;
        if (entityindex == -1) {
        	listener1  = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>("dota_player_update_selected_unit", event =>OnSelectUnit(event,"dota_player_update_selected_unit"))
            listener2  = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>("dota_player_update_query_unit", event =>OnSelectUnit(event,"dota_player_update_query_unit"))
            listener3  = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>("play_sound", event =>OnSelectUnit(event))
            listener4  = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>( "dota_inventory_changed", event =>OnSelectUnit(event) );
            listener5  = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>( "dota_inventory_item_changed", event =>OnSelectUnit(event) );
            listener6  = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>( "dota_portrait_ability_layout_changed", event =>OnSelectUnit(event) );
            listener7  = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>( "dota_ability_changed", event =>OnSelectUnit(event) );
            listener8  = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>( "dota_hero_ability_points_changed", event =>OnSelectUnit(event) );
            listener9  = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>( "m_event_dota_inventory_changed_query_unit", event =>OnSelectUnit(event) );
            listener10 = GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>( "m_event_keybind_changed", event =>OnSelectUnit(event) );

            GameEvents.Subscribe<{str:string,int:string,agi:string,BaseStr:string,BaseAgi:string,BaseInt:string}>("master", data => {
                str = Math.floor(Number(data.str) )
                agi = Math.floor(Number(data.agi))
                int = Math.floor(Number(data.int))
                BaseStr= Math.floor(Number(data.BaseStr))
                BaseAgi= Math.floor(Number(data.BaseAgi))
                BaseInt= Math.floor(Number(data.BaseInt))
            });
        }
        function OnSelectUnit(event:{ splitscreenplayer: PlayerID},name?:string){ 
            isInAttackingBoss = true;
            if(name == "dota_player_update_selected_unit"){
                entityindex = Players.GetSelectedEntities(event.splitscreenplayer)[0];
            }else if(name == "dota_player_update_query_unit"){
                entityindex = Players.GetQueryUnit(event.splitscreenplayer)
            }
            if(entityindex != -1){
                GameEvents.SendCustomGameEventToServer<object>('master',{entityindex:entityindex})
            } 
        }
    return () => {
        if (listener1 && listener2 && listener3) {
            GameEvents.Unsubscribe(listener1);
            GameEvents.Unsubscribe(listener2);
            GameEvents.Unsubscribe(listener3);
            GameEvents.Unsubscribe(listener4);
            GameEvents.Unsubscribe(listener5);
            GameEvents.Unsubscribe(listener6);
            GameEvents.Unsubscribe(listener7);
            GameEvents.Unsubscribe(listener8);
            GameEvents.Unsubscribe(listener9);
            GameEvents.Unsubscribe(listener10);
        }
        $.CancelScheduled(iScheduleHandle);
    } },[]);
        /* 头像 */
    return  <Panel id="LeftPanel">
            {/* 经验值 */}
            <Panel id="DOTAXP" hittest={false}>
                <Panel id="LevelBackground" />
                <Label id="LevelLabel" className="MonoNumbersFont" text={Level} hittest={false} />
                <CircularProgressBar id="CircularXPProgress" >
                    <Panel id="CircularXPProgressBlur_FG" style={{clip:CircularXPProgress}} />
                </CircularProgressBar> 
                <CircularProgressBar id="CircularXPProgressBlur" hittest={false} >
                    <Panel id="CircularXPProgressBlur_FG" style={{clip:CircularXPProgress}} />
                </CircularProgressBar> 
                <Label id="XPLabel" text={XP} style={{opacity:'1'}} hittest={false} />
                <Label id="LifetimeLabel" className="MonoNumbersFont" text="#DOTA_Hud_Lifetime" hittest={false} />
                <ProgressBar id="LifetimeProgress" className="MonoNumbersFont" hittest={false} />
            </Panel>
            {/* 经验值 */}
        <Panel id='LeftFlowChildren'>
            <Panel id="left_flare">
                    <Panel id="HUDSkinFXLeftFlare" className="hud_skinnable" hittest={false} />
                </Panel> 
            <Panel id="PortraitGroup">
                {/* 头像 */}
                <DOTAParticleScenePanel id="PortraitStreakParticle" unit={'npc_dota_hero_rubick'} map={'scenes/dota_ui_particle_scene_panel_empty'} camera={"default_camera"}
                particleonly={false} cameraOrigin="-300 0 0" lookAt="0 0 60" fov={50} hittest={false} />
                <Panel id="PortraitStreakParticleBorder" hittest={false} className="" />
                <Panel id="PortraitBacker" hittest={false} />
                <Panel id="PortraitBackerColor" hittest={false} />
                <Panel id="PortraitContainer" hittest={false}>
                    <Image id="RightSideHeroBlur" src="panel://portraitHUD" hittest={false} />
                    <Panel id="SilenceIcon" hittest={false} always-cache-composition-layer={true} />
                    <Panel id="MutedIcon" hittest={false} always-cache-composition-layer={true} />
                    <Panel id="DeathGradient" />
                </Panel>
                {/* 头像 */}
                {/*基础属性*/}
                <Panel id='DOTAStatsRegion' hittest={false} hittestchildren={false}>
                    <Panel id="Aligner">
                        <Panel id="StatContainer">
                            <Panel id="Damage" className="StatIconLabel">
                                <Panel className="LabelColumn">
                                    <Label id="DamageLabelBase" className="MonoNumbersFont StatRegionLabel BaseLabel" text={DamageBase} />
                                    <Label id="DamageLabelModifier" style={DamageLabelModifierStyle} className="MonoNumbersFont StatRegionLabel" text={DamageLabelModifier} />
                                </Panel>
                                <Panel id="DamageIcon" className="StatIcon" />
                            </Panel>
                            <Panel id="AttackSpeed" className="StatIconLabel">
                                <Panel className="LabelColumn">
                                        <Label id="AttackSpeedLabelBase" className="MonoNumbersFont StatRegionLabel BaseLabel" text={AttackSpeedLabelBase} />
                                </Panel>
                                <Panel id="AttackSpeedIcon" className="StatIcon" />
                            </Panel>
                            <Panel id="Armor" className="StatIconLabel">
                                <Panel className="LabelColumn">
                                    <Label id="ArmorLabel" className="MonoNumbersFont StatRegionLabel BaseLabel" text={ArmorLabelBase} />
                                    <Label id="ArmorLabelModifier" style={ArmorLabelModifierStyle} className="MonoNumbersFont StatRegionLabel" text={ArmorLabelModifier} />
                                </Panel>
                                <Panel id="ArmorIcon" className="StatIcon" />
                            </Panel>
                            <Panel id="MagicResist" className="StatIconLabel">
                                <Panel className="LabelColumn">
                                    <Label id="MagicResistLabel" style={MagicResistStyle} className="MonoNumbersFont StatRegionLabel BaseLabel" text={MagicResistLabelBase} />
                                </Panel>
                                <Panel id="MagicResistanceIcon" className="StatIcon" />
                            </Panel>
                            <Panel id="MoveSpeed" className="StatIconLabel">
                                <Label id="MoveSpeedLabel" className="MonoNumbersFont StatRegionLabel BaseLabel" text={MoveSpeedLabelBase} />
                                <Panel id="MoveSpeedIcon" className="StatIcon" />
                            </Panel>
                        </Panel>
                    </Panel>
                </Panel>
                {/*基础属性*/}
                {/*力量智力敏捷*/}
                <Panel id='DOTAHUDStrAgiInt'>
                    <Panel id="Strength" className="AttrIconContainer">
                        <Panel className="HighlightStatIcon" hittest={false} />
                        <Label id="StrengthLabel" className="StatLabel" style={StrengthStyle} text={Strength} hittest={false} />
                        <Label id="StrengthModifierLabel" className="MonoNumbersFont StatModifier" style={StrengthModifierStyle} text={StrengthModifier} />
                        <Panel id="StrengthIcon" className="StatIcon" hittest={false} />
                    </Panel>
                    <Panel id="Agility" className="AttrIconContainer">
                        <Panel className="HighlightStatIcon" hittest={false} />
                        <Label id="AgilityLabel" className="StatLabel" text={Agility} style={AgilityStyle} hittest={false} />
                        <Label id="AgilityModifierLabel" className="MonoNumbersFont StatModifier" style={AgilityModifierStyle} text={AgilityModifier} />
                        <Panel id="AgilityIcon" className="StatIcon" hittest={false} />
                    </Panel>
                    <Panel id="Intelligence" className="AttrIconContainer">
                        <Panel className="HighlightStatIcon" hittest={false} />
                        <Label id="IntelligenceLabel" className="StatLabel" text={Intelligence} style={IntelligenceStyle} hittest={false} />
                        <Label id="IntelligenceModifierLabel" className="MonoNumbersFont StatModifier" style={IntelligenceModifierStyle} text={IntelligenceModifier} />
                        <Panel id="IntelligenceIcon" className="StatIcon" hittest={false} />
                    </Panel>
                </Panel>
                {/*力量智力敏捷*/}
            </Panel>  
        </Panel>
    </Panel>
}

//右边,道具
function InventoryListPanel({entityindex,InventoryPanels}:{entityindex:EntityIndex | -1,InventoryPanels:ItemEntityIndex[]}){
    if(entityindex != -1 && InventoryPanels.length != 0){
        return <Panel className='DOTAInventory' hittest={false}>
        <Panel id="inventory_items" hittest={false} require-composition-layer={true} always-cache-composition-layer={true}>
            <Panel id="InventoryContainer">
                <Panel id="InventoryBG" className="InventoryBackground" hittest={true} />
                <Panel id="HUDSkinInventoryBG" className="InventoryBackground" hittest={false} />
                <Panel id="inventory_list_container" hittest={false}>
                <Panel id='inventory_list' hittest={false} >
                    {[...Array(3).keys()].map((key) => {return <DOTAInventoryPanel key={key.toString()} entityindex={entityindex} slot={key+1} ability={InventoryPanels[key]} />}) }
                </Panel>
                <Panel id='inventory_list2' hittest={false} >
                    {[...Array(3).keys()].map((key) => {return <DOTAInventoryPanel key={key+3} entityindex={entityindex} slot={key+4} ability={InventoryPanels[key+3]} />}) }
                </Panel>
                </Panel>
                <Panel id="inventory_backpack_list" hittest={false} />
                <Panel id="BackpackShadow" hittest={false} />
            </Panel>
        </Panel>
    </Panel> 
    }
    return <Panel className='null' hittest={false}/>
}
let AbilityChargesCooldownLength:number[] = [];


var m_LastUpdateTime = 0;
var m_IsLocalHero = true;
var m_DaoShu_LastLevel = 0;
var m_XinFa_LastLevel = 0;
