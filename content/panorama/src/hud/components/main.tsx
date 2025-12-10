import React, { useState,useEffect } from "react";
import { useMemo, type FC } from 'react';
export function MainPanel() {
    const [Test, setTest] = useState({[0]:['xianshi','显示']}) as any
	useEffect(() => {
		// 切换面板
        GameEvents.Subscribe<{value: string}>("test", data => {
            if(data.value=='yincang'){
                setTest([['xianshi','显示']])
            }else if(data.value=='xianshi'){
                setTest([
                        ['diren' ,'敌人'],
                        ['duiyou' ,'队友'],
                        ['shengji' ,'升级'],
                        ['ditu' ,'地图'],
                        ['shanchuditu' ,'删除地图'],
                        ['qidong' ,'启动'],
                        ['guanbi' ,'关闭'],
                        ['beibao' ,'背包'],
                        ['yincang','隐藏']   
                ])
            }
        });
	}, []);  

    function Hang({slot}:{slot:number}){
        function onactivate(){
            $.Msg(Test[slot][0])
            if(Test[slot][0] == 'qidong'){
                GameUI.global.branch = 'qidong'
            }else if(Test[slot][0] == 'guanbi'){
                GameUI.global.branch = 'guanbi'
            }else{
                GameEvents.SendCustomGameEventToServer<object >('test',{value:Test[slot][0]})
            }
        }
        return (<Label onactivate={onactivate} style={{height:'45px',width:'120px',  color: "red", fontSize: "25px",border: '5px solid #222222',backgroundColor: '#fcf7f7dd'}} text={Test[slot][1]} />)
    }  
    return (
        <Panel id={'daojv'} style={{ flowChildren: "down", verticalAlign: "bottom", horizontalAlign: "left"}} hittest={false}>
            {[...Array(Test.length).keys()].map((key) => {return <Hang key={key.toString()} slot={key} />}) }    
            <Label id={'jiazai'} />
        </Panel>
    );
}  
