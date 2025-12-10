// components/HealthBar.tsx
import React,{ useState,useEffect,useRef } from 'react';
import classNames from 'classnames';


export function HealthBar({entityindex}:{entityindex:EntityIndex}){
    const [healthPercent, setHealthPercent] = useState(100);
    const [position, setPosition] = useState({ x: 0, y: 0});
    const [heightOffset,setheightOffset] = useState(100)
    const [width,setwidth] = useState(150)
    const [barColor,setbarColor] = useState('#FF0000')
    const [duration,setduration] = useState(-1)

    // 更新血条状态
    useEffect(() => {
        let update = () => {
            // 更新血量
            const hp = Entities.GetHealth(entityindex);
            const maxHp = Entities.GetMaxHealth( entityindex );
            setHealthPercent((hp / maxHp) * 100);
        // 更新位置
        //const worldPos =  GetEntScreenXY(entityindex)
        const worldPos = [
            Entities.GetAbsOrigin(entityindex)[0],
            Entities.GetAbsOrigin(entityindex)[1],
            Entities.GetAbsOrigin(entityindex)[2]
        ];
        const ScreenX = Game.WorldToScreenX(worldPos[0], worldPos[1], worldPos[2] + Entities.GetHealthBarOffset( entityindex ))
        const ScreenY = Game.WorldToScreenY(worldPos[0], worldPos[1], worldPos[2] + Entities.GetHealthBarOffset( entityindex ))
        //$.Msg(ScreenX,'ASD',ScreenY)
        setPosition({
            x: ScreenX,
            y: ScreenY,
            //visible: ScreenX > 0 && ScreenY > 0
        });
        }
        let iScheduleHandle:any;
        let think = () => {
            iScheduleHandle = $.Schedule(0.03, think)
            update();
        }
        think();
    return () => {
        $.CancelScheduled(iScheduleHandle);
    } },[entityindex]);

    // 自动销毁逻辑
    // React.useEffect(() => {
    //     if (duration <= 0) return;
        
    //     const timer = $.Schedule(duration, () => {
    //         $.GetContextPanel().DeleteAsync(0);
    //     });
        
    //     return () => $.CancelScheduled(timer);
    // }, [duration]);

    //if (!position.visible) return null;

    // 动态颜色 - 血量越低颜色越红
    const dynamicColor = healthPercent < 30 ? '#FF0000' : 
                        healthPercent < 60 ? '#FFA500' : 
                        barColor;
    let ratio = 1080 / Game.GetScreenHeight();
    return (
        <Panel 
            style={{
                position: `${ratio * (position.x - width/2)}px ${ratio *  position.y}px 0`,   // - width/2 +160+xAdjust
                width: `${width}px`,
                //opacity: '1',
                backgroundColor: dynamicColor
            }}
            hittest={false}
        >
            {/* 背景条 */}
            <Panel >
                {/* 实际血条 */}
                <Panel 
                    style={{
                        height: '10px',
                        width: `${Math.max(0, healthPercent)}%`,
                        backgroundColor: dynamicColor
                    }} 
                />
            </Panel>
            
            {/* 血量文本 */}
            <Label 
                text={`${Math.floor(Entities.GetHealth(entityindex))}/${Math.floor(Entities.GetMaxHealth( entityindex ))}`} 
            />
        </Panel>
    );
};


/**
 * 获取单位屏幕坐标
 * @param ent
 * @returns
 */
function GetEntScreenXY(ent: EntityIndex) {
  const pos = Entities.GetAbsOrigin(ent);
  //高度偏移为血条一半
  const offset = Entities.GetHealthBarOffset(ent);
  pos[2] += offset / 2;
  return WorldToScreenXY(pos);
}
/**
 * 屏幕坐标距离
 * @param pos1
 * @param pos2
 * @returns
 */
function ScreenLength(pos1: [number, number], pos2: [number, number]) {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}
/**
 * 世界坐标转换到屏幕坐标
 * @param pos
 * @returns
 */
function WorldToScreenXY(pos: [number, number, number]): [number, number] {
  let screenX = Game.WorldToScreenX(pos[0], pos[1], pos[2]);
  let screenY = Game.WorldToScreenY(pos[0], pos[1], pos[2]);
  if (screenX < 0) screenX = 0;
  if (screenX > Game.GetScreenWidth()) screenX = Game.GetScreenWidth();
  if (screenY < 0) screenY = 0;
  if (screenY > Game.GetScreenHeight()) screenY = Game.GetScreenHeight();
  return [screenX, screenY];
}