import React, { useState,useEffect,useRef,useCallback  } from "react";
import { render, useGameEvent, useNetTableKey, useRegisterForUnhandledEvent } from 'react-panorama-x';
import classNames from 'classnames';
interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
}
export function BagCustomTooltip(_data: any){
  const [Tooltip,setTooltip] = useState({visible:true,x:0,y:0})
  // 使用useCallback缓存函数引用
  const updateTooltip = useCallback((visible: boolean, x: number, y: number) => {
  setTooltip({ visible, x, y });
  }, []);

  // 组件挂载时注册全局方法
  useEffect(() => {
  GameUI.global.CustomTooltip = {
    show: (x: number, y: number) => updateTooltip(false, x, y),
    hide: () => updateTooltip(true, 0, 0)
  };

  return () => {
    // 组件卸载时清理
    GameUI.global.CustomTooltip = undefined;
  };
  }, [updateTooltip]);
  let ratio = 1080 / Game.GetScreenHeight();
  let [x,y] = [Tooltip.x+80,Tooltip.y]

return (
    <Panel id={'aaa123'} hittestchildren={false}  className={classNames({ 'collapse': Tooltip.visible })} 
    style={{flowChildren:"down",height:'250px',width:'200px',border:'1px solid #000000',backgroundColor:'#ffffff',fontSize:'20px',zIndex:1,
    position:ratio*x+'px '+ratio*y+'px 0px'}}  />)   //
}