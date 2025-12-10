import { render } from 'react-panorama-x';
import React, { useState,useEffect,useRef } from "react";
import classNames from 'classnames';
import {DOTAAbilityList,DOTAInventoryPanel} from './ability_panel';
import {HealthManaContainerPanel} from './health_mana_container';



let isInAttackingBoss = false;
let entityindex:EntityIndex | -1 = -1
let m_AbilityPanels:AbilityEntityIndex[] = [];
let m_InventoryPanels:ItemEntityIndex[] = [];

export function UnitPanel() {
    const [abilityPanels, setAbilityPanels] = useState<AbilityEntityIndex[]>([]);
    const [MiddleWidth,setMiddleWidth] = useState<Partial<number>>(321)
    const MiddlePanelStyle = {width: MiddleWidth+'px'}
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
                    setMiddleWidth( m_AbilityPanels.length*80)
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
                <MiddlePanel MiddlePanelStyle = {MiddlePanelStyle}   HealthManaWidth = {MiddleWidth+80}/>
                <Panel id='RightPanel' hittest={false}>
                    <InventoryListPanel entityindex = {entityindex}  InventoryPanels={m_InventoryPanels} />
                </Panel>
                
            </Panel>
        </Panel>
}

function MiddlePanel({ MiddlePanelStyle,HealthManaWidth }: { MiddlePanelStyle: Partial<VCSSStyleDeclaration>,HealthManaWidth:number }) {
    const MiddlePanelBackgroundImageStyle={
        width: '100%',
        height: '145px',
        transitionDuration: '0.05s',
        transitionProperty: 'background-image',
        transitionTimingFunction: 'ease-in-out',
        backgroundImage: 'url("s2r://panorama/images/hud/reborn/ability_bg_psd.vtex")',
        backgroundSize: '100%',
        verticalAlign: 'bottom'
      }
    const  AbilitiesAndStatBranchStyle={
        horizontalAlign: "center",
        verticalAlign: "bottom",
        flowChildren: "right"
    }

    const MiddleFlowChildrenStyle={
        width: '100%',
        height: '100%',
        flowChildren: 'right'
    }
    return (
        <Panel id={"MiddlePanel"} style={MiddlePanelStyle} hittest={false}>
        <Panel id="MiddlePanelBackgroundImage" style={MiddlePanelBackgroundImageStyle} hittest={false}/>
        <Panel id="AbilitiesAndStatBranch" style={AbilitiesAndStatBranchStyle} hittest={false}>
            {/* 技能 */}
            <DOTAAbilityList entityindex = {entityindex} AbilityPanels={m_AbilityPanels}/>
            {/* 技能 */}
        </Panel>
        <Panel id="MiddleFlowChildren" style={MiddleFlowChildrenStyle} hittest={false}>
        {/* 魔法和生命条 */}
        <HealthManaContainerPanel entityindex = {entityindex}  HealthManaWidth={HealthManaWidth} />
        {/* 魔法和生命条 */}
        </Panel>
</Panel>
    )
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
        let listeners: GameEventListenerID[] = []
        if (entityindex == -1) {
            ["dota_player_update_selected_unit", "dota_player_update_query_unit", "play_sound", "dota_inventory_changed", "dota_inventory_item_changed", "dota_portrait_ability_layout_changed", "dota_ability_changed", "dota_hero_ability_points_changed", "m_event_dota_inventory_changed_query_unit", "m_event_keybind_changed"].forEach(eventName => {
                listeners.push(GameEvents.Subscribe<{ splitscreenplayer: PlayerID }>(eventName, (event) => OnSelectUnit(event, eventName)));
            });
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
        listeners.forEach(eventName => {
            GameEvents.Unsubscribe(eventName)});
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
                {/* <DOTAParticleScenePanel id="PortraitStreakParticle" unit={'npc_dota_hero_rubick'} map={'scenes/dota_ui_particle_scene_panel_empty'} camera={"default_camera"}
                particleonly={false} cameraOrigin="-300 0 0" lookAt="0 0 60" fov={50} hittest={false} /> */}
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
