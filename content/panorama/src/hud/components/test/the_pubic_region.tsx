import React, { useState,useEffect,useRef,Component  } from "react";
import { render, useGameEvent, useNetTableKey, useRegisterForUnhandledEvent } from 'react-panorama-x';
import classNames from 'classnames';

// 天灵根示例（金属性为主） const tianLinggenGrid = generateDantian("Tian", ["metal"]);
//import {GenerateDantian} from './generate_spiritual_root'
const elements = ['metal', 'wood', 'water', 'fire', 'earth'] as const;
type elements = typeof elements[number];
    const TetrominoShapes: Record<string, number[][]> = {
        I: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        O: [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        T: [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        L: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        J: [
            [0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        S: [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        Z: [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ]
    };
const elementSymbols = {
    'metal': { background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', color: '#D4AF37' },
    'wood': { background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: '#2E7D32' },
    'water': { background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)', color: '#2196F3'},
    'fire':  { background: 'linear-gradient(135deg, #F44336 0%, #B71C1C 100%)', color: '#F44336' },
    'earth': { background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)', color: '#795548' }
};

export function ThePubicRegionPanel(){
    interface Cell {
    index: number;
    opacity:string;
    Pstate?:number[];
    elements:elements
    }
    const [WuXing, setWuXing] = useState(CustomNetTables.GetTableValue("wu_xing", "player_" + Game.GetLocalPlayerID()) || null  ) as any
    // 监听背包数据变化
    useEffect(() => {
        const listener = CustomNetTables.SubscribeNetTableListener("wu_xing", (_, eventKey, eventValue) => {
            if ("player_" + Game.GetLocalPlayerID() === eventKey) {
                if (eventValue) {
                    $.Msg("Dantian grid updated:", eventValue);
                    setWuXing(eventValue);
                }
            }
        });
        return () => {
            CustomNetTables.UnsubscribeNetTableListener(listener);
        };
    }, []);

    const position: {row: number;col: number;} = { row: 9, col: 9 };

    // 使用 useEffect 在 dantianGrid 变化时重新计算 PuzzleData
    
    const [puzzleData, setPuzzleData] = useState<Cell[][]>([]);
    useEffect(() => {
        $.Msg("无形",WuXing.length,"无形",WuXing);
        if (WuXing) {
            $.Msg("WuXing && WuXing.length === 5)无形:");
            const newPuzzleData = initializePuzzleData(position.row, position.col, WuXing);
            setPuzzleData(newPuzzleData);
        }
    }, [WuXing, position.row, position.col]);

    // 提取初始化邏輯到獨立函數
function initializePuzzleData(rows: number, cols: number, wuxingData: Array<Array<elements>>): Cell[][] {
    const newPuzzleData: Cell[][] = [];
    $.Msg("Dantian grid 无形:", wuxingData);
    for (let i = 0; i < rows; i++) {
        newPuzzleData[i] = [];
        for (let j = 0; j < cols; j++) {
            const isCenterRegion = i >= 2 && i <= 6 && j >= 2 && j <= 6;
            const isyincang = (i < 2 || i > 6) && (j < 2 || j > 6);
            const opacity = isCenterRegion ? '1' : isyincang ? '0' : '0.6';
            
            // 安全訪問 WuXing 數據
            let element: elements;
            const dantianRow = ((i - 2) % 5 + 5) % 5;
            const dantianCol = ((j - 2) % 5 + 5) % 5;
            element = wuxingData[dantianRow][dantianCol];
            newPuzzleData[i][j] = {
                index: i * cols + j + 1,
                opacity: opacity,
                elements: element 
            };
        }
    }
    $.Msg("Initialized PuzzleData:", newPuzzleData);
    return newPuzzleData;
}
    //分界线
    const PuzzleContainer = () => (
        <Panel style={{
            flowChildren: "down",  // 垂直排列子元素
            height: 63*position.row+  'px',
            width:  63*position.col+  'px', 
            horizontalAlign: 'center',
            verticalAlign: 'center'
        }}> 
            {[...Array(position.row).keys()].map((row) => (
                <PuzzleRow rowIndex={row} key={`row-${row}`}/>
            ))}  
        </Panel>
    );

    /**
     * 背包行组件
     * @param rowIndex 行索引(0-5)
     */
    const PuzzleRow = ({ rowIndex}: { rowIndex: number}) => (
        <Panel style={{
            flowChildren: "right",  // 水平排列子元素
        }}> 
            {[...Array(position.col).keys()].map((col) => (
                <Puzzle
                    slot={rowIndex * position.col + col + 1}  // 计算槽位编号(1-36)
                    key={`slot-${rowIndex}-${col}`} 
                />
            ))} 
        </Panel>
    );

    function Drag({panelId,draggedPanel,Color}:{panelId:PanelBase, draggedPanel:any,Color:string}){
        const shapeMatrix = TetrominoShapes['L'];
        let P =  <Panel style={{
            flowChildren: "down",  // 垂直排列子元素
            height: '315px',  // 5 * 63 = 315
            width: '315px',}}> 

            {[...Array(5).keys()].map((row) => (
                <Panel key={`drag-row-${row}`} style={{flowChildren: "right"}}>
                    {[...Array(5).keys()].map((col) => {
                        // 判断是否为L形区域（左上角3x3区域）
                        const isLShape = row < 3 && col < 3;
                        //const opacity = isLShape ? '1' : '0'; // L形区域不透明，其他半透明
                        const shouldShow = shapeMatrix[row]?.[col] === 1;
                        return (
                            <Label 
                                key={`drag-cell-${row}-${col}`}  // 添加单元格key
                                hittest={false}   
                                style={{
                                    height: '60px',
                                    width: '60px',
                                    margin: '1px',
                                    opacity: shouldShow ? '1' : '0',
                                    borderTop: "5px solid #FF0000",
                                    borderRight: "5px solid #00FF00",
                                    borderBottom: "5px solid #0000FF",
                                    borderLeft: "5px solid #FFFF00",
                                    border: '2px solid #666',
                                    backgroundColor: Color
                                }}
                            />
                        );
                    })}
                </Panel> 
            ))}  
        </Panel>
                GameUI.global.Drag?.show(P)
                draggedPanel.displayPanel = GameUI.global.DragRef.current;
                draggedPanel.offsetX = 157.5;
                draggedPanel.offsetY = 157.5;
        return  
    }

    function Puzzle({slot}:{slot:number}){  //
        const itemRef = useRef<Panel>(null);
        
        const zhuan = puzzleData[Math.floor((slot - 1) / position.col)]?.[(slot - 1) % position.col];
        
        if (!zhuan) return null; // 安全处理
        let Color:string = elementSymbols[zhuan.elements].color   
        let opacity:string = zhuan.opacity
        $.Msg("Rendering Puzzle Slot:", slot,zhuan,Color);
        let style:Partial<VCSSStyleDeclaration> = {height:'60px',width:'60px',marginTop:'1px',marginBottom:'1px',marginLeft:'1px',marginRight:'1px',opacity:opacity,
                        borderTop: "5px solid #FF0000",
                        borderRight: "5px solid #00FF00",
                        borderBottom: "5px solid #0000FF",
                        borderLeft: "5px solid #FFFF00",
            backgroundColor:Color}
        useRegisterForUnhandledEvent('DragStart',(panelId:PanelBase, draggedPanel ) => {
            let eself = itemRef.current;
            if(eself && eself == panelId){
                Drag({panelId,draggedPanel,Color})
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
            console.log
            if(eself && eself == panelId){
                GameEvents.SendCustomGameEventToServer<DragEvent>('drag',{panel1:panelId.id,panel2:draggedPanel.id})
            }
        }, []);

        useRegisterForUnhandledEvent('DragEnd',(panelId, draggedPanel) => {
            let eself = itemRef.current;
            if(eself && eself == panelId){
                GameUI.global.Drag?.hide()
            }
        }, []);

        function AbilityShowTooltip()
        {
            if(itemRef.current){
                const pos = itemRef.current.GetPositionWithinWindow()
            }
        }   
        
        function AbilityHideTooltip()
        {
        }

        return(
        <Panel id={'Dantian'+'-'+slot} draggable={true} ref={itemRef} onmouseover={AbilityShowTooltip} onmouseout={AbilityHideTooltip} > 
            {<Label hittest={false}   style={style}/>}
        </Panel> 
        )
    } 
return (<>
            <Label 
                onactivate={() => {$.Msg("重新生成")}}
                style={{
                    horizontalAlign: 'right',
                    verticalAlign: 'center',
                    height: '40px',
                    width: '120px',
                    color: "red",
                    fontSize: "25px",
                    border: '5px solid #222222',
                    backgroundColor: '#fcf7f7dd'
                }} 
                text={'重新生成'} 
            />
<PuzzleContainer />
</>
)
}