import React, { useState,useEffect,useRef } from "react";

/* 魔法和生命条 */
export function HealthManaContainerPanel({entityindex,HealthManaWidth}:{entityindex: EntityIndex | -1,HealthManaWidth:number}){
    //魔法和生命条
    let [Mana,setMana] = useState<string>('1')
    let [ManaRegen,setManaRegen] = useState<number | string>(1)
    let [ManaProgress,setManaProgress] = useState<number>(100)
    let [Health,setHealth] = useState<string>('1')
    let [HealthRegen,setHealthRegen] = useState<number | string>(1)
    let [HealthProgress,setHealthProgress] = useState<number>(100)
    const HealthManaContainerStyle:Partial<VCSSStyleDeclaration> = {
        width: '95%',
        height: 'fit-children',
        visibility: 'visible',
        verticalAlign: 'bottom',
        horizontalAlign: 'center',
        flowChildren: 'down',
        marginBottom: '5px'
    }
    const HealthManaItemStyle: Partial<VCSSStyleDeclaration> = {
        width: '100%',
        height: '26px',
        marginBottom: '2px'
    };
    const LabelStyle: Partial<VCSSStyleDeclaration>={
        textAlign: 'center',
        verticalAlign: 'top',
        fontWeight: 'bold',
        fontSize: '18px',
        width: '332px',
        color: 'white',
        horizontalAlign: 'center',
        marginTop: '2px',
        overflow: 'clip',
        zIndex: 3,
        textShadow: '0px 1px 4px 3 #000000'
    }
    const ProgressBarStyle={
        borderRadius: '0px',
        height: '100%',
        width: '100%',
        backgroundColor: 'none',
        border: '0px'
    }
    const HealthProgressLeftStyle={
        height: '100%',
        width:(HealthProgress*100).toString()+'%',
        borderRadius: '3px',
        backgroundColor: 'gradient(linear, 0% 0%, 0% 100%, from(#425d25), color-stop(0.2, #5BA539), color-stop(0.5, #4D9030), to(#425d25))'
    }
    const HealthProgressRightStyle={
        height:'100%',
        width: '100%',
        backgroundColor: 'gradient(linear, 0% 0%, 0% 100%, from(#17200d), color-stop(0.2, #222e13), color-stop(0.5, #1e2911), to(#17200d))',
        zIndex: -3,
    }
    const ManaProgressLeftStyle={
        height: '100%',
        width:(ManaProgress*100).toString()+'%',
        borderRadius: '3px',
        backgroundColor: 'gradient(linear, 0% 0%, 0% 100%, from(#2b4287), color-stop(0.2, #4165ce), color-stop(0.5, #4a73ea), to(#2b4287))'
    }
    const ManaProgressRightStyle={
        height:'100%',
        width: '100%',
        backgroundColor:'gradient(linear, 0% 0%, 0% 100%, from(#101932), color-stop(0.2, #172447), color-stop(0.5, #162244), to(#101932))', 
        zIndex: -3,
    }
    const DotaSceneContainerStyle:Partial<VCSSStyleDeclaration>= {
        width: '100%',
        height: '100%',
        overflow: 'clip'
    }
    const RegenLabelStyle:Partial<VCSSStyleDeclaration>={
        fontSize: '14px',
        textShadow: '0px 2px 4px #000000',
        fontWeight: 'bold',
        marginTop: '1px',
        marginRight: '4px',
        textAlign: 'right',
        verticalAlign: 'center',
        paddingRight: '2px',
        horizontalAlign: 'right',
        zIndex: 4
    }
    const ManaRegenLabelStyle = {
        ...RegenLabelStyle,
        color:'#83C2FE',
    }
    const HealthRegenLabelStyle = {
        ...RegenLabelStyle,
        color:'#3ED038',
    }
    useEffect(() => {
        let update = () => {
            if(entityindex != -1){
                setMana(Entities.GetMana(entityindex).toString()+' / '+Entities.GetMaxMana(entityindex).toString())
                setManaProgress((Entities.GetMana(entityindex)/Entities.GetMaxMana(entityindex)))
                setManaRegen('+'+Entities.GetManaThinkRegen(entityindex).toFixed(1))
                setHealth(Entities.GetHealth(entityindex).toString()+' / '+Entities.GetMaxHealth(entityindex).toString())
                setHealthProgress((Entities.GetHealth(entityindex)/Entities.GetMaxHealth(entityindex)))
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
    } },[entityindex]);
    return  <Panel id="HealthManaContainer" style={HealthManaContainerStyle}  hittest={false}>
        <Panel id="HealthContainer" style={HealthManaItemStyle}  hittest={false}>
            <Label id="HealthLabel"  style={LabelStyle} className="MonoNumbersFont" text={Health} hittest={false} />

            <Panel id="HealthProgress" style={ProgressBarStyle}  >
                <Panel id="HealthProgress_Left" style={HealthProgressLeftStyle} className="ProgressBarLeft">
                    <Panel style={DotaSceneContainerStyle}>
                        <DOTAScenePanel id="HealthBurner" style={{width: '100%',height: '100%'}}   map="scenes/hud/healthbarburner" renderdeferred={false} rendershadows={false} camera="camera_1" hittest={false} particleonly={true} />
                    </Panel>
                </Panel>
                <Panel id="HealthProgress_Right" style={HealthProgressRightStyle}/>
            </Panel>

            <Label id="HealthRegenLabel" style={HealthRegenLabelStyle} className="MonoNumbersFont" text={HealthRegen} hittest={false} />
        </Panel>
        <Panel id="ManaContainer" style={HealthManaItemStyle} hittest={false}>
            <Label id="ManaLabel" style={LabelStyle} className="MonoNumbersFont" text={Mana} hittest={false} />

            <Panel id="ManaProgress" style={ProgressBarStyle}>
                <Panel id="ManaProgress_Left" style={ManaProgressLeftStyle}>
                    <Panel style={DotaSceneContainerStyle}>
                        <DOTAScenePanel id="ManaBurner" style={{ width: '100%',height: '100%',opacity:'0.4',hueRotation:'50deg'}}  map="scenes/hud/healthbarburner" renderdeferred={false} rendershadows={false} camera="camera_1" hittest={false} particleonly={true} />
                    </Panel>
                </Panel>
                <Panel id="ManaProgress_Right" style={ManaProgressRightStyle}/>
            </Panel>
            
            <Label id="ManaRegenLabel" style={ManaRegenLabelStyle} className="MonoNumbersFont" text={ManaRegen} hittest={false} />
        </Panel>
    </Panel>
}