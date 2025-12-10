import React, { useState,useEffect,useRef,Component  } from "react";
import { render, useGameEvent, useNetTableKey, useRegisterForUnhandledEvent } from 'react-panorama-x';
import classNames from 'classnames';
/*
素材名字
多种属性
*/ 
// 定义背包数据类型
interface BagData {
    switch: boolean;
    [slot: number]: string | number;
}
// 定义自定义事件类型
interface DragEvent {
    panel1: string;
    panel2: string;
    unit?: number;
}
export function BagPanel() {
	const [BagCNT, setBagCNT] = useState(CustomNetTables.GetTableValue("bag", "player_" + Game.GetLocalPlayerID()) || {switch:false}   ) as any
    // 监听背包数据变化
	useEffect(() => {
		const listener = CustomNetTables.SubscribeNetTableListener("bag", (_, eventKey, eventValue) => {
			if ("player_" + Game.GetLocalPlayerID() === eventKey) {
                //$.Msg(eventValue)
				setBagCNT(eventValue);
			}
		});
		return () => {
			CustomNetTables.UnsubscribeNetTableListener(listener);
		};
	}, []);
    if(BagCNT.switch == false){
        return null
    }
     const BagContainer = () => (
        <Panel style={{
            flowChildren: "down",  // 垂直排列子元素
            height: '800px',
            width: '800px', 
            horizontalAlign: 'right'
        }}> 
            {[...Array(6).keys()].map((row) => (
                <BagRow rowIndex={row} key={`row-${row}`} />
            ))}  
        </Panel>
    );

    /**
     * 背包行组件
     * @param rowIndex 行索引(0-5)
     */
    const BagRow = ({ rowIndex }: { rowIndex: number }) => (
        <Panel style={{
            flowChildren: "right",  // 水平排列子元素
            backgroundColor: '#222222'  // 行背景色
        }}> 
            {[...Array(6).keys()].map((col) => (
                <BagItem 
                    slot={rowIndex * 6 + col + 1}  // 计算槽位编号(1-36)
                    key={`slot-${rowIndex}-${col}`} 
                />
            ))} 
        </Panel>
    );

    //背包个
    function BagItem({slot}:{slot:number}){  //
        const itemId = BagCNT[slot]
        let zifuchuanjieqv
        const itemRef = useRef<Panel>(null);
        useRegisterForUnhandledEvent('DragStart',(panelId, draggedPanel) => {
            let eself = itemRef.current as any;
            if(eself && eself == panelId  && itemId != -1){
                if (GameUI.global.CustomTooltip) {GameUI.global.CustomTooltip.hide()}
                zifuchuanjieqv = itemId.slice(0,itemId.indexOf("_"));
                var displayPanel;
                displayPanel = $.CreatePanel( "DOTAItemImage", $.GetContextPanel(), 'bag-'+slot );
                displayPanel.itemname = itemId;
                displayPanel.style.height = '64px';
                displayPanel.style.width = '88px';
                draggedPanel.displayPanel = displayPanel;
                draggedPanel.offsetX = 0;
                draggedPanel.offsetY = 0;
                return true;
            }
        }, []);
        useRegisterForUnhandledEvent('DragLeave',(panelId, draggedPanel) => {
            let eself = itemRef.current;
            if(eself && eself == panelId){
            }
        }, []);
        useRegisterForUnhandledEvent('DragEnter',(panelId, draggedPanel) => {
            let eself = itemRef.current;
            if(eself && eself == panelId){
            }
        }, []);

        useRegisterForUnhandledEvent('DragDrop',(panelId, draggedPanel) => {
            let eself = itemRef.current;
            if(eself && eself == panelId){
                GameEvents.SendCustomGameEventToServer<DragEvent>('drag',{panel1:panelId.id,panel2:draggedPanel.id})
            }
        }, []);

        useRegisterForUnhandledEvent('DragEnd',(panelId, draggedPanel) => {
            let eself = itemRef.current;
            if(eself && eself == panelId){
                draggedPanel.DeleteAsync( 0 );
            }
        }, []);
        let style:Partial<VCSSStyleDeclaration> = {height:'64px',width:'88px',marginTop:'4px',marginBottom:'4px',marginLeft:'4px',marginRight:'4px',border:'2px solid black' }
        let ItemPanel:JSX.Element;
        function AbilityShowTooltip()
        {
            if(itemId != -1){
                if(itemRef.current){
                    const pos = itemRef.current.GetPositionWithinWindow()
                    GameUI.global.CustomTooltip?.show(pos.x,pos.y) 
                }
            }
        }   
        
        function AbilityHideTooltip()
        {
            if(itemId != -1){
                GameUI.global.CustomTooltip?.hide()
            }
        }
        ItemPanel = <DOTAItemImage hittest={false} itemname={itemId}  style={style}/>
 
        return(
        <Panel id={'bag-'+slot} ref={itemRef} draggable={true} onmouseover={AbilityShowTooltip} onmouseout={AbilityHideTooltip} > 
            {ItemPanel}
        </Panel> 
        )
    } 
    return ( 
        <Panel id="BagPanel" style={{ width: '100%',height: '100%'}} hittest={false} >
            <BagContainer/>
        </Panel>
    );
}  
