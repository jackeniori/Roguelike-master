import React, { useState, useEffect, useRef, Component } from "react";
import { render, useGameEvent, useNetTableKey, useRegisterForUnhandledEvent } from 'react-panorama-x';
import classNames from 'classnames';

// 天灵根示例（金属性为主） const tianLinggenGrid = generateDantian("Tian", ["metal"]);
// import {GenerateDantian} from './generate_spiritual_root'
const elements = ['metal', 'wood', 'water', 'fire', 'earth'] as const;
type elements = typeof elements[number];

// 俄罗斯方块形状定义
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

// 五行元素对应的样式
const elementSymbols = {
    'metal': { background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', color: '#D4AF37' },
    'wood': { background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: '#2E7D32' },
    'water': { background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)', color: '#2196F3' },
    'fire': { background: 'linear-gradient(135deg, #F44336 0%, #B71C1C 100%)', color: '#F44336' },
    'earth': { background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)', color: '#795548' }
};

export function ThePubicRegionPanel() {
    // 单元格接口定义
    interface Cell {
        index: number;
        opacity: string;
        Pstate?: number[];
        elements: elements
    }

    // 获取五行数据状态
    const [WuXing, setWuXing] = useState(CustomNetTables.GetTableValue("wu_xing", "player_" + Game.GetLocalPlayerID()) || null) as any;

    // 监听五行数据变化
    useEffect(() => {
        const listener = CustomNetTables.SubscribeNetTableListener("wu_xing", (_, eventKey, eventValue) => {
            if ("player_" + Game.GetLocalPlayerID() === eventKey) {
                if (eventValue) {
                    setWuXing(eventValue);
                }
            }
        });
        return () => {
            CustomNetTables.UnsubscribeNetTableListener(listener);
        };
    }, []);

    // 网格位置定义
    const position: { row: number; col: number; } = { row: 9, col: 9 };

    // 存储拼图数据状态
    const [puzzleData, setPuzzleData] = useState<Cell[][]>([]);
    
    // 当五行数据变化时重新计算拼图数据
    useEffect(() => {
        if (WuXing) {
            $.Msg("五行数据更新，重新计算拼图数据:", WuXing);
            setPuzzleData(NowInitializePuzzleData(WuXing.gridData,WuXing.initialRegion));
        }
    }, [WuXing, position.row, position.col]);

    // 提取现在的丹田
    function NowInitializePuzzleData(wuxingData: Array<Array<elements>>,
        initialRegion: { startX: number; startY: number; rows: number; cols: number }): Cell[][] {
        const Data: Cell[][] = [];
        
        // 1. 获取丹田尺寸和起始位置
        const row = initialRegion.rows;      // 丹田行数，如3
        const col = initialRegion.cols;      // 丹田列数，如3
        const startX = initialRegion.startX; // 在5x5总网格中的起始X坐标，如1
        const startY = initialRegion.startY; // 在5x5总网格中的起始Y坐标，如1
        
        // 2. 计算环状区域的行列数
        const ringRows = Math.floor(row / 2);  // ✅ 第1行：计算环状区域的行数
        const ringCols = Math.floor(col / 2);  // ✅ 第2行：计算环状区域的列数
        
        // 3. 计算总显示区域
        const totalRows = row + ringRows * 2;  // 总显示行数 = 丹田行数 + 环状行数×2
        const totalCols = col + ringCols * 2;  // 总显示列数 = 丹田列数 + 环状列数×2
        
        for (let i = 0; i < totalRows; i++) {
            Data[i] = [];
            for (let j = 0; j < totalCols; j++) {
                // 4. 判断是否为中央区域（五行区域）
                const isCenterRegion = i >= ringRows &&    // 行坐标不小于环状行数
                                    i < ringRows + row &&  // 行坐标小于环状行数+丹田行数
                                    j >= ringCols &&    // 列坐标不小于环状列数
                                    j < ringCols + col;   // 列坐标小于环状列数+丹田列数
                // ✅ 第3行：判断当前坐标是否在中心区域
                // 中心区域是丹田的实际显示区域
                
                // 5. 判断是否为隐藏区域（四个角落）
                const ishidden = (i < ringRows || i >= ringRows + row) &&  // 行坐标在环状区域外
                                (j < ringCols || j >= ringCols + col);    // 列坐标在环状区域外
                // ✅ 第4行：判断是否为四个角落区域
                // 角落区域是完全透明的区域
                
                // 6. 设置透明度
                const opacity = isCenterRegion ? '1' : ishidden ? '0' : '0.6';
                // ✅ 第5行：根据区域类型设置透明度
                // 中心区域：完全不透明(1)
                // 角落区域：完全透明(0)
                // 环状区域：半透明(0.6)
                
                // 7. 初始化元素
                let element: elements  = "metal";  // 默认元素
                let dantianRow: number;  // 五行行坐标
                let dantianCol: number;  // 五行列坐标
                
                // 8. 计算相对坐标
                const relativeRow = i - ringRows;  // 计算相对于丹田起始的行坐标
                const relativeCol = j - ringCols;  // 计算相对于丹田起始的列坐标
                
                // 9. 对丹田尺寸取模（环面映射）
                dantianRow = ((relativeRow % row + row) % row) + 1 + startX;  // ✅ 第6行：计算五行行坐标
                dantianCol = ((relativeCol % col + col) % col) + 1 + startY;  // ✅ 第7行：计算五行列坐标
                // 双重取模技巧：((a % n + n) % n) 确保结果在[0, n-1]范围内
                // +1 是因为五行数据使用1-based索引
                // +startX/+startY 是起始偏移
                
                // 10. 安全获取五行元素
                if (wuxingData[dantianRow] && wuxingData[dantianRow][dantianCol]) {
                    // 11. 只有当透明度为1时才显示五行元素
                    element = wuxingData[dantianRow][dantianCol];
                }
                
                // 12. 索引计算
                const index = i * totalCols + j + 1;  // 用totalCols，不是col
                
                // 创建单元格数据
                Data[i][j] = {
                    index: index,
                    opacity: opacity,
                    elements: element
                };
                
                $.Msg(`坐标:(${i},${j}), 五行:(${dantianRow},${dantianCol}), 元素:${element}, 透明度:${opacity}`);
        }
    }
    
    return Data;
}
    // 拼图容器组件
    const PuzzleContainer = () => {
        // 如果五行数据为空，则显示空白
        if (!WuXing) {
            return (
                <Panel></Panel>
            );
        }
        if(WuXing.switch) {
            return (
                <Panel></Panel>
            ); 
        }
        // 当五行数据存在时，渲染完整的拼图区域
        return (
            <Panel style={{
                flowChildren: "down",
                height: 63 * position.row + 'px',
                width: 63 * position.col + 'px',
                horizontalAlign: 'center',
                verticalAlign: 'center'
            }}>
                {[...Array(position.row).keys()].map((row) => (
                    <PuzzleRow rowIndex={row} key={`row-${row}`} />
                ))}
            </Panel>
        );
    };

    /**
     * 拼图行组件
     * @param rowIndex 行索引(0-8)
     */
    const PuzzleRow = ({ rowIndex }: { rowIndex: number }) => (
        <Panel style={{
            flowChildren: "right",  // 水平排列子元素
        }}>
            {[...Array(position.col).keys()].map((col) => (
                <Puzzle
                    slot={rowIndex * position.col + col + 1}  // 计算槽位编号(1-81)
                    key={`slot-${rowIndex}-${col}`}
                />
            ))}
        </Panel>
    );

    // 拖动显示组件
    function Drag({ panelId, draggedPanel, Color }: { panelId: PanelBase, draggedPanel: any, Color: string }) {
        const shapeMatrix = TetrominoShapes['L'];
        let P = <Panel style={{
            flowChildren: "down",  // 垂直排列子元素
            height: '315px',  // 5 * 63 = 315
            width: '315px',
        }}>

            {[...Array(5).keys()].map((row) => (
                <Panel key={`drag-row-${row}`} style={{ flowChildren: "right" }}>
                    {[...Array(5).keys()].map((col) => {
                        // 判断是否应该显示（根据L形形状）
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

    // 单个拼图块组件
    function Puzzle({ slot }: { slot: number }) {
        const itemRef = useRef<Panel>(null);

        // 获取当前槽位对应的单元格数据
        const zhuan = puzzleData[Math.floor((slot - 1) / position.col)]?.[(slot - 1) % position.col];

        if (!zhuan) return null; // 安全处理
        let Color: string = elementSymbols[zhuan.elements].color
        let opacity: string = zhuan.opacity
        let style: Partial<VCSSStyleDeclaration> = {
            height: '60px',
            width: '60px',
            marginTop: '1px',
            marginBottom: '1px',
            marginLeft: '1px',
            marginRight: '1px',
            opacity: opacity,
            borderTop: "5px solid #FF0000",
            borderRight: "5px solid #00FF00",
            borderBottom: "5px solid #0000FF",
            borderLeft: "5px solid #FFFF00",
            backgroundColor: Color
        }

        // 注册拖动开始事件
        useRegisterForUnhandledEvent('DragStart', (panelId: PanelBase, draggedPanel) => {
            let eself = itemRef.current;
            if (eself && eself == panelId) {
                Drag({ panelId, draggedPanel, Color })
                return true;
            }
        }, []);

        // 注册拖动离开事件
        useRegisterForUnhandledEvent('DragLeave', (panelId, draggedPanel) => {
            let eself = itemRef.current;
            if (eself && eself == panelId) {
            }
        }, []);

        // 注册拖动进入事件
        useRegisterForUnhandledEvent('DragEnter', (panelId, draggedPanel) => {
            let eself = itemRef.current;
            if (eself && eself == panelId) {
            }
        }, []);

        // 注册拖动放下事件
        useRegisterForUnhandledEvent('DragDrop', (panelId, draggedPanel) => {
            let eself = itemRef.current;
            console.log
            if (eself && eself == panelId) {
                GameEvents.SendCustomGameEventToServer<DragEvent>('drag', { panel1: panelId.id, panel2: draggedPanel.id })
            }
        }, []);

        // 注册拖动结束事件
        useRegisterForUnhandledEvent('DragEnd', (panelId, draggedPanel) => {
            let eself = itemRef.current;
            if (eself && eself == panelId) {
                GameUI.global.Drag?.hide()
            }
        }, []);

        // 显示工具提示
        function AbilityShowTooltip() {
            if (itemRef.current) {
                const pos = itemRef.current.GetPositionWithinWindow()
            }
        }

        // 隐藏工具提示
        function AbilityHideTooltip() {
        }

        return (
            <Panel id={'Dantian' + '-' + slot} draggable={true} ref={itemRef} onmouseover={AbilityShowTooltip} onmouseout={AbilityHideTooltip}>
                {<Label hittest={false} style={style} />}
            </Panel>
        )
    }

    return (<>
        <PuzzleContainer />
    </>
    )
}