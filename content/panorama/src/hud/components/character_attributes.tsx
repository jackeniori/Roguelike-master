import React, { useState,useEffect,useRef } from "react";
import { render, useGameEvent, useNetTableKey, useRegisterForUnhandledEvent } from 'react-panorama-x';

export function CharacterAttributesPanel(){
    const [CACNT, setCACNT] = useState(CustomNetTables.GetTableValue("character_attributes", "player_" + Game.GetLocalPlayerID()) || {switch:false}   ) as any
    // 监听背包数据变化
    useEffect(() => {
        const listener = CustomNetTables.SubscribeNetTableListener("character_attributes", (_, eventKey, eventValue) => {
            if ("player_" + Game.GetLocalPlayerID() === eventKey) {
                //$.Msg(eventValue)
                setCACNT(eventValue);
            }
        });
        return () => {
            CustomNetTables.UnsubscribeNetTableListener(listener);
        };
    }, []);
    const textstyle = {color: "red", fontSize: "30px", border: '5px solid #222222', backgroundColor: '#fcf7f7dd', height:'50px', width:'200px'}
     const BagContainer = () => (
        <Panel style={{
            flowChildren: "down",  // 垂直排列子元素
            height: '800px',
            width: '800px', 
            horizontalAlign: 'right'
        }}> 
            <Label text={"力量:"+100} style={textstyle} />
            <Label text="敏捷:" style={textstyle} />
            <Label text="智力:" style={textstyle} />
            <Label text="攻击力:" style={textstyle} />
            <Label text="生命值:" style={textstyle} />
            <Label text="法力值:" style={textstyle} />
            <Label text="速度:" style={textstyle} />
            <Label text="暴击率:" style={textstyle} />
            <Label text="暴击伤害:" style={textstyle} />
            <Label text="命中率:" style={textstyle} />
            <Label text="闪避率:" style={textstyle} />
            <Label text="生命回复:" style={textstyle} />
            <Label text="内力回复:" style={textstyle} />
            <Label text="行动力:" style={textstyle} />
            <Label text="行动力回复:" style={textstyle} />
        </Panel>
    );

    return (
        <Panel id={'CharacterAttributes'} hittestchildren={false} 
            style={{verticalAlign: "center", horizontalAlign: "center",flowChildren:"down",height:'1050px',width:'1050px',border:'10px solid #000000',backgroundColor:'#ffffff',fontSize:'20px'}} >
                <BagContainer/>
        </Panel>
    )
}  
