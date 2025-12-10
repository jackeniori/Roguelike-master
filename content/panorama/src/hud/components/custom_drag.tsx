
import classNames from "classnames";
import React, { useState,useEffect,useRef,Component, useCallback  } from "react";
export function CustomDrag(){
    GameUI.global.DragRef = useRef<Panel>(null);
  const [Drag,setDrag] = useState(<Panel/>)
  const [Hide,setHide] = useState(false)
  // 使用useCallback缓存函数引用
  const updateDrag = useCallback((panel:JSX.Element,hide:boolean) => {
  setHide(hide)
  setDrag(panel);
  }, []);
  // 组件挂载时注册全局方法
  useEffect(() => {
  GameUI.global.Drag = {
    show: (panel:JSX.Element) => updateDrag(panel,false),
    hide: () => updateDrag(<Panel/>,true)
  };

  return () => {
    // 组件卸载时清理
    GameUI.global.Drag = undefined;
  };
  }, [updateDrag]);
    return <Panel   ref={GameUI.global.DragRef} draggable={true}  className={classNames({ 'collapse': Hide })} > 
        {Drag} 
    </Panel>
}