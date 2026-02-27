import React, { useState,useEffect,useRef,Component  } from "react";
import { render, useGameEvent, useNetTableKey, useRegisterForUnhandledEvent } from 'react-panorama-x';
import classNames from 'classnames';
export function PuzzlePanel(){
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
interface Cell {
  Color: string;
  index: number;
  Pstate?:number[];
}
    // 方块生成逻辑
    const [currentTetromino, setCurrentTetromino] = useState<any>(null);
    //行列
    const [position, setPosition] = useState({ row: 10, col: 8 });
    // const spawnNewTetromino = () => {
    //     const type = Object.keys(TetrominoShapes)[Math.floor(Math.random() * Object.keys(TetrominoShapes).length)];
    //     setCurrentTetromino({ type, rotation: 0 });
    //     setPosition({ row: 0, col: Math.floor(Column / 2) - 1 });
    // };
    let PuzzleData: Cell[][] = [];

    for(let i =0;i < position.row; i++){
        PuzzleData[i] = []
        for(let j =0;j < position.col; j++){
            PuzzleData[i][j] = {Color:'#ffffff',index:i*position.col+j+1}
        }
    }
    function Button(){
        const type = Object.keys(TetrominoShapes)[Math.floor(Math.random() * Object.keys(TetrominoShapes).length)];
        setCurrentTetromino({ type, rotation: 0 });
        let cro:string = currentTetromino?.type
        let xy:[number, number][] = []
        let slotT = []
        if(cro){
            for(let i =0;i < kuan; i++){
                for(let j =0;j < gao; j++){
                    if(TetrominoShapes[type][i][j] == 1  ){
                        xy.push([i,j])
                        slotT.push(ArrangeToSlot({ name:'tetromino',  row:i, col:j }))
                    }
                }
            }
        }
        const safeSlotT = slotT.filter((item): item is number => item !== undefined);
        for (let i = 0; i < xy.length; i++) {
            const [x, y]: [number, number] = xy[i]
            resetGrid[x][y].Pstate = safeSlotT;
            resetGrid[x][y].Color = '#000000'
        }  
                // resetGrid[i][j].Color = TetrominoShapes[type][i][j] === 1 
                //     ? '#000000' : '#ffffff';
                // resetGrid[i][j].Pstate = type
        setTetrominoData(resetGrid)
        //$.Msg(resetGrid)
    }

    let [kuan,gao] = [4,4]
    let resetGrid:Cell[][] = []
    for(let i =0;i < kuan; i++){
        resetGrid[i] = []
        for(let j =0;j < gao; j++){
            resetGrid[i][j] = {Color:'#ffffff',index:i*gao+j+1}
        }
    } 
    const [TetrominoData,setTetrominoData] = useState<Cell[][]>(resetGrid)
    //生成俄罗斯方块形拼图
    function Tetromino(){
        currentTetromino
        return  <Panel 
            style={{
            flowChildren: "down",  // 垂直排列子元素
            height: 42*4+  'px',
            width:  42*4+  'px', 
            horizontalAlign: 'left',
            verticalAlign: 'center',
            marginLeft:'100px'
        }}> 
            {[...Array(4).keys()].map((row) => (
                <TetrominoRow rowIndex={row} key={`Trow-${row}`} data={{name:'tetromino'}} />
            ))}  
        </Panel>
    }
    const TetrominoRow = ({ rowIndex ,data}: { rowIndex: number,data:any }) => (
        <Panel style={{
            flowChildren: "right",  // 水平排列子元素
            backgroundColor: '#222222'  // 行背景色
        }}> 
            {[...Array(4).keys()].map((col) => (
                <Puzzle
                    slot={rowIndex * 4 + col + 1}  // 计算槽位编号(1-16)
                    data={data}
                    key={`slot-${rowIndex}-${col}`} 
                />
            ))} 
        </Panel>
    );
    const PuzzleContainer = () => (
        <Panel style={{
            flowChildren: "down",  // 垂直排列子元素
            height: 42*position.row+  'px',
            width:  42*position.col+  'px', 
            horizontalAlign: 'center',
            verticalAlign: 'center'
            
        }}> 
            {[...Array(position.row).keys()].map((row) => (
                <PuzzleRow rowIndex={row} key={`row-${row}`} data={{name:'Puzzle'}}/>
            ))}  
        </Panel>
    );

    /**
     * 背包行组件
     * @param rowIndex 行索引(0-5)
     */
    const PuzzleRow = ({ rowIndex ,data}: { rowIndex: number,data:any }) => (
        
        <Panel style={{
            flowChildren: "right",  // 水平排列子元素
            backgroundColor: '#222222'  // 行背景色
        }}> 
            {[...Array(position.col).keys()].map((col) => (
                
                <Puzzle
                    slot={rowIndex * position.col + col + 1}  // 计算槽位编号(1-36)
                    data={data}
                    key={`slot-${rowIndex}-${col}`} 
                />
            ))} 
        </Panel>
    );
    
function Drag({Color}:{Color:string}){
    return  <Panel style={{height:'40px',width:'40px',marginTop:'1px',marginBottom:'1px',marginLeft:'1px',marginRight:'1px',border:'1px solid black', 
                backgroundColor:Color}}> 
            </Panel>
}

function SlotToArrange({slot,name}:{slot:number,name?:string}){
    let data 
        if(name == 'puzzle'){
            data = PuzzleData[Math.floor((slot-1)/position.col)][((slot-1)%position.col)]
        }else if(name == 'tetromino'){
            data = TetrominoData[Math.floor((slot-1)/4)][((slot-1)%4)]
        } 
    return data
}
function ArrangeToSlot({name,row,col}:{name:string,row:number,col:number}){
    let index 
        if(name == 'puzzle'){
           index = row * position.col + col + 1
        }else if(name == 'tetromino'){
           index = row * 4 + col + 1
        }
    return index
}
    function Puzzle({slot,data}:{slot:number,data:any}){  //
        const itemId = `BagCNT`[slot]
        const itemRef = useRef<Panel>(null);
        let name = data.name
        let zhuan:Cell | undefined = SlotToArrange({slot,name})
        let Color:string = zhuan? zhuan.Color : '#ffffff'
        //拖拽
        useRegisterForUnhandledEvent('DragStart',(panelId:PanelBase, draggedPanel ) => {
            let eself = itemRef.current;
            if(eself && eself == panelId){
                if(zhuan){$.Msg(zhuan.Pstate)}
                
                GameUI.global.Drag?.show(Drag({Color}))
                draggedPanel.displayPanel = GameUI.global.DragRef.current;
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

        let style:Partial<VCSSStyleDeclaration> = {height:'40px',width:'40px',marginTop:'1px',marginBottom:'1px',marginLeft:'1px',marginRight:'1px',border:'1px solid black', 
            backgroundColor:Color
        }
        let ItemPanel:JSX.Element;
        function AbilityShowTooltip()
        {
            if(itemRef.current){
                const pos = itemRef.current.GetPositionWithinWindow()
            }
        }   
        
        function AbilityHideTooltip()
        {
        }
        ItemPanel = <Label hittest={false}   style={style}/>
 
        return(
        <Panel id={name+'-'+slot} draggable={true} ref={itemRef} onmouseover={AbilityShowTooltip} onmouseout={AbilityHideTooltip} > 
            {ItemPanel}
        </Panel> 
        )
    } 
return (<>
<Label  onactivate={Button}
    style={{
    horizontalAlign: 'right',
    verticalAlign: 'center',
    height:'40px',width:'100px',  color: "red", fontSize: "25px",border: '5px solid #222222',backgroundColor: '#fcf7f7dd'}} text={'生成'} />
<Tetromino />
<PuzzleContainer />
</>
)
}  //flowChildren:"down",border:'1px solid #000000',backgroundColor:'#ffffff'   