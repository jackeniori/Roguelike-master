import React, { useState, useEffect, useRef } from "react";
import classNames from 'classnames';

// 全局变量：存储技能充能冷却时长和技能面板列表
let AbilityChargesCooldownLength: number[] = [];
let AbilityPanels: AbilityEntityIndex[] = [];

/**
 * 技能列表组件
 * @param entityindex 实体索引
 * @param AbilityPanels 技能面板数组(可选)
 */
export function DOTAAbilityList({ entityindex, AbilityPanels }: { entityindex: EntityIndex | -1, AbilityPanels?: AbilityEntityIndex[] }) {
    // 如果实体有效且有技能面板数据，则渲染技能列表
    if (entityindex != -1 && AbilityPanels) {
        return <Panel className='DOTAAbilityList' hittest={false}>
            {/* 遍历技能面板数组生成技能面板 */}
            {[...Array(AbilityPanels.length).keys()].map((key) => {
                return <DOTAAbilityPanel 
                    key={key.toString()} 
                    entityindex={entityindex} 
                    slot={key + 1} 
                    ability={AbilityPanels[key]} 
                />;
            })}
        </Panel>;
    }
    // 否则返回空面板
    return <Panel className='null' hittest={false}></Panel>;
}

/**
 * 单个技能面板组件
 * @param entityindex 实体索引
 * @param ability 技能实体索引
 * @param slot 技能槽位
 */
function DOTAAbilityPanel({ entityindex, ability, slot }: { entityindex: EntityIndex, slot: number, ability: AbilityEntityIndex }) {
    const refSelf = useRef(null);
    
    // 检查玩家是否可控制该实体
    const bControllable = Entities.IsControllableByPlayer(entityindex, Players.GetLocalPlayer());
    // 获取可用的技能点数
    const iAbilityPoints = Entities.GetAbilityPoints(entityindex);
    // 获取技能最大等级和当前等级
    const MaxLevel = Abilities.GetMaxLevel(ability);
    const MLevel = Abilities.GetLevel(ability);
    const IsAuto = Abilities.IsAutocast(ability);
    const IsCooldownReady =  Abilities.IsCooldownReady(ability)
    const IsPassive = Abilities.IsPassive(ability)
    const UsesAbilityCharges = Abilities.UsesAbilityCharges(ability)
    // 技能面板基础样式
    const DOTAAbilityPanelStyle: Partial<VCSSStyleDeclaration> = {
        width: '65px',
        verticalAlign: 'bottom',
        marginBottom: '0px',
        visibility: 'visible',
        transitionProperty: 'width',
        transitionDuration: '0s',
        transitionTimingFunction: 'ease-in-out'
    };

    // 按钮和等级容器样式
    const ButtonAndLevelStyle = {
        height: '180px',
        horizontalAlign: 'center',
        zIndex: 1,
        flowChildren: 'none'
    };

    // 升级按钮十字亮光状态和样式
    const [levelUpIconisHovered, setlevelUpIconIsHovered] = useState(false);
    const levelUpIconStyle = {
        horizontalAlign: 'center',
        verticalAlign: 'middle',
        width: "24px",
        height: "24px",
        backgroundImage: `url("s2r://panorama/images/hud/reborn/${
            levelUpIconisHovered ? "levelup_plus_fill_psd" : "levelup_plus_well_psd"
        }.vtex")`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        transitionProperty: "background-image",
        transitionDuration: "0.12s",
    };

    // 带升级标签的按钮样式
    const buttonWithLevelUpTabStyle = {
        verticalAlign: 'bottom',
        height: '104px',
        marginBottom: '24px',
        paddingLeft: '2px',
        backgroundColor: 'transparent',
        zIndex: 1,
        flowChildren: 'none',
        horizontalAlign: 'center'
    };

    // 升级标签样式
    const levelUpTabStyle = {
        width: "100%",
        height: "36px",
        marginBottom: "-4px",
        zIndex: 2,
        transitionProperty: "opacity, filter",
        transitionTimingFunction: "ease-in-out",
        transitionDuration: "0.12s",
    };

    // 升级按钮样式
    const levelUpButtonStyle = {
        width: "100%",
        height: "36px",
        backgroundImage: `url("s2r://panorama/images/hud/reborn/levelup_button_2_psd.vtex")`,
        backgroundSize: "100% 100%",
        backgroundPosition: "50% 50%",
        backgroundRepeat: "no-repeat",
        transitionProperty: "opacity, brightness, pre-transform-scale2d",
        transitionTimingFunction: "ease-in-out",
        transitionDuration: "0.12s",
        marginBottom: "-4px"
    };

    // 技能图标悬停状态和样式
    const [AbilityImageStyleisHovered, setAbilityImageStyleIsHovered] = useState(false);
    const abilityImageStyle: Partial<VCSSStyleDeclaration> = {
        width: "100%",
        height: "100%",
        zIndex: -1,
        brightness: AbilityImageStyleisHovered ? "1.6" : "1",
        margin: "7px",
        transitionProperty: 'pre-transform-scale2d',
        transitionDuration: '.12s',
        transitionTimingFunction: 'ease-in'
    };

    // 升级光照效果样式
    const levelUpLightStyle = {
        width: "100%",
        height: "82px",
        backgroundImage: 'url("s2r://panorama/images/hud/reborn/levelup_lightcast_psd.vtex")',
        backgroundSize: "100% 100%",
        backgroundPosition: "0px 2px",
        backgroundRepeat: "no-repeat",
        marginTop: "30px",
        zIndex: 0,
        transitionProperty: "opacity",
        transitionTimingFunction: "ease-in-out",
        transitionDuration: "0.32s",
    };

    // 技能按钮背景样式
    const buttonWellStyle = {
        width: "54px",
        height: "54px",
        marginBottom: "8px",
        verticalAlign: "bottom",
        backgroundImage: 'url("s2r://panorama/images/hud/reborn/active_ability_border_psd.vtex")',
        backgroundSize: "58px 58px",
        backgroundPosition: "50% 50%",
        backgroundRepeat: "no-repeat",
        zIndex: 0,
    };

    // 自动施法边框样式
    const AutocastableStyle = {
        backgroundImage: 'url("s2r://panorama/images/hud/reborn/autocastable_ability_border_psd.vtex")',
        backgroundSize: '100% 100%',
        width: '100%',
        height: '100%',
        opacity: '1',
        margin: '0px',
        transitionProperty: 'background-image',
        transitionDuration: '0.16s',
        transitionTimingFunction: 'ease-in-out'
    };

    // 自动施法容器样式
    const AutoCastingContainerStyle = {
        width: '100%',
        height: '100%',
        transitionProperty: 'opacity',
        transitionDuration: '0.12s',
        transitionTimingFunction: 'ease-in-out',
    };

    // 按钮尺寸样式(根据是否自动施法调整大小)
    const ButtonSizeStyle = {
        transitionProperty: 'box-shadow',
        transitionDuration: '0.2s',
        transitionTimingFunction: 'ease-in-out',
        verticalAlign: 'middle',
        horizontalAlign: 'center',
        width: IsAuto ? "50px" : "64px",
        height: IsAuto ? "50px" : "64px"
    };

    // 技能按钮样式
    const AbilityButtonStyle = {
        width: "100%",
        height: "100%",
        backgroundColor: "gradient(linear, 0% 0%, 0% 100%, from(#00000000), to(#00000000))",
        transitionProperty: "pre-transform-scale2d, brightness, saturation, background-color, opacity",
        transitionDuration: ".06s, .1s",
        transitionTimingFunction: "ease-out"
    };

    // 技能图标样式
    const AbilityImageStyle = {
        width: "100%",
        height: "100%",
        zIndex: -1,
        margin: "3px",
        transitionProperty: "pre-transform-scale2d",
        transitionDuration: "0.12s",
        transitionTimingFunction: "ease-in",
        washColor:!IsCooldownReady ?'#00000044':null,
        contrast:!IsCooldownReady ?'1':'1',
        saturation:!IsCooldownReady ?'.6':'1',
    };

    // 技能斜面效果样式(被动技能有特殊处理)
    const AbilityBevelStyle: Partial<VCSSStyleDeclaration> = {
        width: "100%",
        height: "100%",
        margin: "2px",
        backgroundImage: 'url("s2r://panorama/images/hud/reborn/ability_bevel_psd.vtex")',
        backgroundSize: "contain",
        backgroundPosition: "50% 50%",
        backgroundRepeat: "no-repeat",
        zIndex: 1,
        backgroundColor: "gradient(linear, 0% 0%, 0% 100%, from(#00FF0000), to(#00FF0000))",
        visibility: "visible",
        transitionProperty: "brightness, background-color",
        transitionDuration: "0.12s",
        transitionTimingFunction: "ease-in",
        transform: IsPassive ? 'rotateZ(180deg)' : null,
        washColor: IsPassive ? '#00000088' : null
    };

    // 冷却计时器样式
    const CooldownTimerStyle: Partial<VCSSStyleDeclaration> = {
        color: 'white',
        fontSize: '28px',
        textShadow: '0px 0px 6px black',
        width: '100%',
        textAlign: 'center',
        verticalAlign: 'center',
        textOverflow: 'shrink'
    };

    // 检查是否为当前激活技能
    const IsActiveAbility = (ability == Abilities.GetLocalPlayerActiveAbility());
    const ActiveAbilityStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: IsActiveAbility ? 'gradient(radial, 50% -20%, 0% 0%, 80% 80%, from(#FFFFFF08), to(#FFFFFF08))' : 'none',
        border: IsActiveAbility ? '4px solid #FFFFFF40' : '0px solid transparent',
        opacity: IsActiveAbility ? '1' : '0'
    };

    // 非激活状态覆盖层样式
    const InactiveOverlayStyle: Partial<VCSSStyleDeclaration> = {
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        visibility: 'collapse',
        opacity: '0.1'
    };

    // 激活技能边框样式
    const ActiveAbilityBorderStyle = {
        backgroundImage: 'url("s2r://panorama/images/hud/reborn/active_ability_border_psd.vtex")',
        backgroundSize: '100% 100%',
        width: '100%',
        height: '100%',
        opacity: '0',
        margin: '2px',
    };

    // 被动技能边框样式
    const PassiveAbilityBorderStyle = {
        backgroundImage: 'url("s2r://panorama/images/hud/passive_ability_border_png.vtex")',
        backgroundSize: '100% 100%',
        width: '100%',
        height: '100%',
        opacity: IsPassive ? '1' : '0',
        margin: '2px'
    };

    // 自动施法技能边框样式
    const AutocastableAbilityBorderStyle = {
        backgroundImage: 'url("s2r://panorama/images/hud/autocastable_ability_border_png.vtex")',
        backgroundSize: '100% 100%',
        width: '100%',
        height: '100%',
        opacity: IsAuto ? '1' : '0',
    };

    // 消耗容器样式
    const CostContainerStyle = {
        horizontalAlign: "right" as any,
        verticalAlign: "bottom",
        backgroundImage: 'url("s2r://panorama/images/hud/reborn/manaamount_bg_png.vtex")',
        backgroundSize: "100% 100%",
        backgroundPosition: "18px 8px",
        backgroundRepeat: "no-repeat",
        marginRight: "2px",
        marginBottom: "2px",
        width: "100%",
        transform: "translateX(4px) translateY(5px)"
    };

    // 消耗子元素样式
    const CostChildrenStyle = {
        flowChildren: 'left',
        horizontalAlign: 'right',
        verticalAlign: 'bottom',
        width: '100%'
    };

    // 技能充能样式
    const AbilityChargesStyle: Partial<VCSSStyleDeclaration> = {
        verticalAlign: "bottom",
        horizontalAlign: "left",
        marginBottom: "10px",
        backgroundColor: 'gradient(linear, 0% 0%, 0% 100%, from(#444), to(black))',
        borderRadius: "50%",
        width: "26px",
        height: "26px",
        zIndex: 1,
        padding: "1px",
        boxShadow: "fill 2px 2px 4px black",
        opacity: UsesAbilityCharges ? '1' : '0',
    };
    // 获取技能冷却总时长
    let cooldownLength = Abilities.GetCooldownLength(ability);
    // 计算冷却相关数据
    const cooldownRemaining = Abilities.GetCooldownTimeRemaining(ability);
    let cooldownPercent = cooldownRemaining / cooldownLength;
    const chargeRestoreRemaining = Abilities.GetAbilityChargeRestoreTimeRemaining(ability);
    const maxCooldown = AbilityChargesCooldownLength[ability] || 0;

    // 更新最大冷却时间
    if (chargeRestoreRemaining > maxCooldown) {
        AbilityChargesCooldownLength[ability] = chargeRestoreRemaining;
    }

    // 计算充能进度角度
    const progressAngle = chargeRestoreRemaining > 0
        ? 360 - (chargeRestoreRemaining / AbilityChargesCooldownLength[ability] * 360)
        : 360;
    // 充能边框样式(带进度动画)
    const AbilityChargesBorderStyle = {
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        border: "2px solid #86d64c",
        clip: `radial(50% 50%, 0deg, ${progressAngle}deg)`
    };

    // 充能数字样式
    const abilityChargesTxTStyle: Partial<VCSSStyleDeclaration> = {
        marginTop: "2px",
        fontSize: "15px",
        width: "100%",
        verticalAlign: "middle",
        textAlign: "center",
        textOverflow: "shrink",
        color: "#FFFFFF"
    };

    // 魔法消耗样式
    const ManaCostStyle: Partial<VCSSStyleDeclaration> = {
        color: "#57b7ff",
        fontSize: "14px",
        textShadow: "0px 0px 3px 3.0 #000000",
        horizontalAlign: "right",
        marginRight: "3px",
        marginBottom: "1px",
        textOverflow: "shrink",
    };

    // 快捷键容器样式
    const HotkeyContainerStyle = {
        marginTop: "41px",
        border: "0px solid white",
        width: "100%",
        height: "100%",
        marginLeft: "-1px",
        zIndex: 5,
    };

    // 技能等级容器样式
    const AbilityLevelContainerStyle = {
        marginTop: "0px",
        backgroundColor: "none",
        width: "fit-children",
        horizontalAlign: "center",
        marginBottom: "20px",
        verticalAlign: "bottom",
        flowChildren: "right",
    };

    /**
     * 获取技能等级点样式
     * @param key 等级索引
     * @param MLevel 当前等级
     * @param levelup 是否可以升级
     */
    const getAbilityLevelStyle = (key: number, MLevel: number, levelup: boolean): Partial<VCSSStyleDeclaration> => {
        const baseStyle: Partial<VCSSStyleDeclaration> = {
            width: "8px",
            height: "4px",
            margin: "3px 2px",
            backgroundSize: "100% 100%",
        };

        // 已学习的等级样式
        if (key < MLevel) {
            return {
                ...baseStyle,
                backgroundImage: "none",
                backgroundColor: "gradient(linear, 0% 0%, 0% 100%, from(#E7D291), to(#887845))",
                borderRadius: "0px"
            };
        }

        // 未学习的等级样式
        if (key > MLevel || (levelup && key == MLevel)) {
            return {
                ...baseStyle,
                borderRadius: "1px",
                backgroundImage: "none",
                backgroundColor: "gradient(linear, 0% 0%, 0% 100%, from(#111111ff), to(#000000ff))"
            };
        }

        // 当前等级的样式
        if (key == MLevel && !levelup) {
            return {
                ...baseStyle,
                border: "1px solid #dbb43466",
                boxShadow: "fill #E0C24E44 0px 0px 6px 0px",
                backgroundImage: 'url("s2r://panorama/images/hud/pip_outline_png.vtex")',
                backgroundColor: "gradient(linear, 0% 0%, 0% 100%, from(#111111ff), to(#000000ff))"
            };
        }

        return baseStyle;
    };
    // 检查是否可以升级
    const levelup: boolean = !(bControllable && iAbilityPoints > 0 && Abilities.CanAbilityBeUpgraded(ability) == AbilityLearnResult_t.ABILITY_CAN_BE_UPGRADED);

    // 渲染技能面板
    return <Panel id='DOTAAbilityPanel' style={DOTAAbilityPanelStyle} hittest={false} ref={refSelf}>
        {/* 主容器 */}
        <Panel id="ButtonAndLevel" style={ButtonAndLevelStyle} hittest={false}>
            {/* 升级特效 */}
            <Panel id="LevelUpBurstFXContainer" style={{ width: "100%", height: "80px" }} className={classNames({ 'collapse': levelup })} hittest={false}>
                <DOTAScenePanel id="LevelUpBurstFX" style={{ width: "100%", height: "100%" }} map="scenes/hud/levelupburst" animate-during-pause={true} renderdeferred={false} rendershadows={false} camera="camera_1" hittest={false} particleonly={true} />
            </Panel>

            {/* 带升级标签的按钮区域 */}
            <Panel id="ButtonWithLevelUpTab" style={buttonWithLevelUpTabStyle} hittest={false}>
                {/* 升级标签按钮 */}
                <Button id="LevelUpTab" style={levelUpTabStyle} hittest={true} className={classNames({ 'collapse': levelup })}
                    onactivate={() => {
                        if (ability != -1 && Entities.IsValidEntity(ability)) {
                            Abilities.AttemptToUpgrade(ability);
                        }
                    }}
                    onmouseover={(self) => {
                        setlevelUpIconIsHovered(true);
                        $.DispatchEvent("DOTAShowAbilityTooltipForEntityIndex", self, Abilities.GetAbilityName(ability), entityindex);
                    }}
                    onmouseout={(self) => {
                        setlevelUpIconIsHovered(false);
                        $.DispatchEvent("DOTAHideAbilityTooltip", self);
                    }}>
                    <Panel id="LevelUpButton" style={levelUpButtonStyle}>
                        <Panel id="LevelUpIcon" style={levelUpIconStyle} />
                    </Panel>
                </Button>

                {/* 升级光照效果 */}
                <Panel id="LevelUpLight" style={levelUpLightStyle} className={classNames({ 'collapse': levelup })} hittest={false} />

                {/* 技能按钮背景 */}
                <Panel id="ButtonWell" style={buttonWellStyle} hittest={false}>
                    {/* 自动施法边框 */}
                    <Panel id="AutocastableBorder" style={AutocastableStyle} hittest={false} />

                    {/* 自动施法特效 */}
                    <Panel id="AutoCastingContainer" style={AutoCastingContainerStyle} className={classNames({ 'collapse': !(IsAuto && Abilities.GetAutoCastState(ability)) })} hittest={false}>
                        <DOTAScenePanel id="AutoCasting" style={{ width: '100%', height: '100%' }} className='SceneLoaded' map="scenes/hud/autocasting" animate-during-pause={true} renderdeferred={false} rendershadows={false} particleonly={true} camera="camera_1" hittest={false} />
                    </Panel>

                    {/* 技能按钮尺寸容器 */}
                    <Panel id="ButtonSize" style={ButtonSizeStyle}>
                        {/* 技能按钮 */}
                        <Panel id="AbilityButton" style={AbilityButtonStyle} hittest={true}
                            onmouseover={(self) => {
                                setAbilityImageStyleIsHovered(true);
                                $.DispatchEvent("DOTAShowAbilityTooltipForEntityIndex", self, Abilities.GetAbilityName(ability), entityindex);
                            }}
                            onmouseout={(self) => {
                                setAbilityImageStyleIsHovered(false);
                                $.DispatchEvent("DOTAHideAbilityTooltip", self);
                            }}
                            onactivate={(self) => { Abilities.ExecuteAbility(ability, entityindex, false) }}
                            ondblclick={(self) => { Abilities.ExecuteAbility(ability, entityindex, false) }}
                            oncontextmenu={(self) => { Game.PrepareUnitOrders({ OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TOGGLE_AUTO, AbilityIndex: ability }); }}>

                            {/* 技能图标 */}
                            <DOTAAbilityImage id="AbilityImage" style={AbilityImageStyle} abilityname={Abilities.GetAbilityName(ability)} className={classNames({ AbilityImageLevel: 0 == Abilities.GetLevel(ability) })} />

                            {/* 技能斜面效果 */}
                            <Panel id="AbilityBevel" style={AbilityBevelStyle} hittest={false} />

                            {/* 闪光效果容器 */}
                            <Panel id="ShineContainer" style={{ width: '100%', height: '100%', margin: '5px' }} hittest={false}>
                                <Panel id="Shine" style={{
                                    animationName: 'none', animationDuration: '0.4s',
                                    backgroundColor: 'gradient(linear, 100% 0%, 0% 100%, from(#00000000), color-stop(0.3, #00000000), color-stop(0.45, #ffffffff), color-stop(0.55, #ffffffff), color-stop(0.7, #00000000), to(#00000000))',
                                    backgroundSize: '100% 100%'
                                }} hittest={false} />
                            </Panel>

                            {/* 冷却相关元素 */}
                            <Panel id="TopBarUltimateCooldown" hittest={false} />
                            <Panel id="Cooldown" style={{ width: "100%", height: "100%", margin: "3px", visibility: IsCooldownReady ? "collapse" : 'visible' }} hittest={false}>
                                <Panel id="CooldownOverlay" style={{
                                    width: '100%', height: '100%', backgroundColor: !IsCooldownReady ? '#000000DD' : '#000000dc',
                                    clip:
                                        // 根据技能类型计算冷却遮罩
                                        !IsCooldownReady
                                            ? UsesAbilityCharges
                                                ? `radial(50% 50%, 0deg, ${-chargeRestoreRemaining / AbilityChargesCooldownLength[ability] * 360}deg)`
                                                : `radial(50% 50%, 0deg, ${-cooldownPercent * 360}deg)`
                                            : null
                                }} hittest={false} />
                                <Label id="CooldownTimer" style={CooldownTimerStyle} className="MonoNumbersFont"
                                    text={Math.ceil(UsesAbilityCharges ? chargeRestoreRemaining : cooldownRemaining)} hittest={false} />
                            </Panel>

                            {/* 激活技能效果 */}
                            <Panel id="ActiveAbility" style={ActiveAbilityStyle} hittest={false} />

                            {/* 非激活状态覆盖层 */}
                            <Panel id="InactiveOverlay" style={InactiveOverlayStyle} hittest={false} />
                        </Panel>

                        {/* 各种边框效果 */}
                        <Panel id="ActiveAbilityBorder" style={ActiveAbilityBorderStyle} hittest={false} />
                        <Panel id="PassiveAbilityBorder" style={PassiveAbilityBorderStyle} hittest={false} />
                        <Panel id="AutocastableAbilityBorder" hittest={false} />

                        {/* 消耗容器 */}
                        <Panel id="CostContainer" style={CostContainerStyle} hittest={false}>
                            <Panel id="CostChildren" style={CostChildrenStyle} hittest={false}>
                                <Label id="GoldCost" style={{}} text="" hittest={false} />
                                <Label id="ManaCost" style={ManaCostStyle} text={Abilities.GetManaCost(ability) || ''} hittest={true} />
                                <Label id="HealthCost" style={{}} text="" hittest={false} />
                            </Panel>
                        </Panel>

                        {/* 各种覆盖层 */}
                        <Panel hittest={false} id="CombineLockedOverlay" />
                        <Panel hittest={false} id="SilencedOverlay" />
                        <Panel hittest={false} id="AbilityStatusOverlay" />
                        <Panel hittest={false} id="UpgradeOverlay" />
                        <Label hittest={false} id="RecommendedUpgradePct" text="" />
                        <Panel hittest={false} id="DropTargetHighlight" />
                    </Panel>
                </Panel>

                {/* 快捷键显示 */}
                <Panel id="HotkeyContainer" style={HotkeyContainerStyle} hittest={false} hittestchildren={false}>
                    <Panel id="Hotkey" className={classNames({ 'collapse': !(Abilities.GetKeybind(ability)) })}>
                        <Label id="HotkeyText" text={Abilities.GetKeybind(ability)} />
                    </Panel>
                </Panel>

                {/* 技能充能显示 */}
                <Panel id="AbilityCharges" hittest={false} style={AbilityChargesStyle} hittestchildren={false}>
                    <Panel id="AbilityChargesBorder" style={AbilityChargesBorderStyle} />
                    <Label style={abilityChargesTxTStyle} text={Abilities.GetCurrentAbilityCharges(ability) || 0} />
                </Panel>
            </Panel>

            {/* 等级梯度效果 */}
            <Panel id="QueryLevelGradient" hittest={false} />

            {/* 技能等级点容器 */}
            <Panel id="AbilityLevelContainer" style={AbilityLevelContainerStyle} hittest={false}>
                {MaxLevel > 0 && [...Array(MaxLevel).keys()].map((key) => {
                    return <Panel key={key.toString()} style={getAbilityLevelStyle(key, MLevel, levelup)} />;
                })}
            </Panel>
        </Panel>
    </Panel>;
}

/**
 * 物品面板组件
 * @param entityindex 实体索引
 * @param ability 物品实体索引
 * @param slot 物品槽位
 */
export function DOTAInventoryPanel({ entityindex, ability, slot }: { entityindex: EntityIndex, slot: number, ability: ItemEntityIndex }) {
    // 空物品槽位渲染
    if (ability == -1) {
        return <Panel id="InventoryButton" require-composition-layer={true} always-cache-composition-layer={true} hittest={false}>
            <Panel id="InventoryItem" hittest={false}>
                <Panel id="InventoryButtonWell" hittest={false}>
                    <Panel id="InventoryButtonSize">
                        <Panel id="ItemButton" hittest={true}>
                            <DOTAItemImage id="ItemImage" itemname='' scaling="stretch-to-fit-x-preserve-aspect" />
                        </Panel>
                    </Panel>
                </Panel>
            </Panel>
            <Panel id="QueryLevelGradient" hittest={false} />
        </Panel>;
    }

    const refSelf = useRef(null);
    const MaxLevel = Abilities.GetMaxLevel(ability);
    const MLevel = Abilities.GetLevel(ability);
    const IsAuto = Abilities.IsAutocast(ability);
    const IsCooldownReady =  Abilities.IsCooldownReady(ability)
    const IsPassive = Abilities.IsPassive(ability)
    const UsesAbilityCharges = Abilities.UsesAbilityCharges(ability)
    // 自动施法状态
    let AutoCastingContainer = { opacity: '0' };
    if (Abilities.IsAutocast(ability) && Abilities.GetAutoCastState(ability)) {
        AutoCastingContainer = { opacity: '1' };
    }

    // 冷却相关计算
    let cooldownLength = Abilities.GetCooldownLength(ability);
    let cooldownRemaining = Abilities.GetCooldownTimeRemaining(ability);
    let cooldownPercent = cooldownRemaining / cooldownLength;
    
    // 冷却覆盖层样式
    let CooldownOverlay: Partial<VCSSStyleDeclaration> = {};
    let Cooldown: Partial<VCSSStyleDeclaration> = { visibility: 'collapse' };
    let ActiveAbility: Partial<VCSSStyleDeclaration> = { opacity: '0' };
    let AbilityCharges: Partial<VCSSStyleDeclaration> = { visibility: 'collapse' };
    let AbilityChargesTxt: string | number = 0;

    // 根据冷却状态设置样式
    if (!Abilities.IsCooldownReady(ability)) {
        Cooldown = { visibility: 'visible' };
        if (Abilities.UsesAbilityCharges(ability)) {
            CooldownOverlay = { clip: 'radial(50% 50%, 0deg,' + (-cooldownRemaining / AbilityChargesCooldownLength[ability] * 360) + "deg)" };
        } else {
            CooldownOverlay = { clip: 'radial(50% 50%, 0deg,' + (-cooldownPercent * 360) + "deg)" };
        }
    }

    // 激活物品样式
    if (ability == Abilities.GetLocalPlayerActiveAbility()) {
        ActiveAbility = { opacity: '1' };
    }

    // 物品悬停状态
    let [InventoryMouse, setInventoryMouse] = useState<string>('');

    // 渲染物品面板
    return <Panel id="InventoryButton" require-composition-layer={true} always-cache-composition-layer={true} hittest={false} ref={refSelf}>
        <Panel id="InventoryItem" hittest={false}>
            {/* 物品按钮背景 */}
            <Panel id="InventoryButtonWell" hittest={false}>
                <Panel id="InventoryButtonSize">
                    {/* 物品按钮 */}
                    <Panel id="ItemButton" className={InventoryMouse} hittest={true}
                        onmouseover={(self) => {
                            $.DispatchEvent("DOTAShowAbilityTooltipForEntityIndex", self, Abilities.GetAbilityName(ability), entityindex);
                            setInventoryMouse('hover');
                        }}
                        onmouseout={(self) => {
                            $.DispatchEvent("DOTAHideAbilityTooltip", self);
                            setInventoryMouse('');
                        }}
                        onactivate={(self) => { Abilities.ExecuteAbility(ability, entityindex, false) }}
                        ondblclick={(self) => { Abilities.ExecuteAbility(ability, entityindex, false) }}
                        oncontextmenu={(self) => { Game.PrepareUnitOrders({ OrderType: dotaunitorder_t.DOTA_UNIT_ORDER_CAST_TOGGLE_AUTO, AbilityIndex: ability }); }}>

                        {/* 物品图标 */}
                        <DOTAItemImage id="ItemImage" itemname={Abilities.GetAbilityName(ability)} scaling="stretch-to-fit-x-preserve-aspect" />

                        {/* 物品斜面效果(非被动物品) */}
                        <Panel hittest={false} className={classNames({ ItemBevel: !IsPassive })} />

                        {/* 冷却相关元素 */}
                        <Panel id="Cooldown" style={Cooldown} hittest={false}>
                            <Panel id="CooldownOverlay" style={CooldownOverlay} hittest={false} />
                            <Label id="ItemCooldownTimer" className="MonoNumbersFont" text={Math.ceil(cooldownRemaining)} hittest={false} />
                        </Panel>

                        {/* 激活物品效果 */}
                        <Panel id="ActiveAbility" style={ActiveAbility} hittest={false} />

                        {/* 非激活状态覆盖层 */}
                        <Panel id="InactiveOverlay" hittest={false} />
                    </Panel>

                    {/* 各种边框和消耗显示 */}
                    <Panel hittest={false} id="ActiveAbilityBorder" />
                    <Panel hittest={false} id="ItemCostContainer">
                        <Panel hittest={false} id="CostChildren">
                            <Label hittest={false} id="ItemManaCost" text={Abilities.GetManaCost(ability) || ''} />
                            <Label id="ItemAltCharges" className='InventoryTXT' text={Items.GetCurrentCharges(ability) || ''} hittest={false} />
                        </Panel>
                    </Panel>
                </Panel>
            </Panel>

            {/* 物品快捷键容器(被动物品不显示) */}
            <Panel id="InventoryItemContainer" className={classNames({ collapse: IsPassive })} hittest={false} hittestchildren={false}>
                <Panel id="InventoryItemHotkey">
                    <Label id="HotkeyText" text={Abilities.GetKeybind(ability)} />
                </Panel>
            </Panel>

            {/* 物品充能显示 */}
            <Panel id="AbilityCharges" hittest={false} style={AbilityCharges} hittestchildren={false}>
                <Panel id="AbilityChargesBorder" />
                <Label text={AbilityChargesTxt} />
            </Panel>
        </Panel>
    </Panel>;
}