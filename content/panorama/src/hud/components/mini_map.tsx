import React, { useState,useEffect,useRef } from "react";
import { CardPanel } from './card';
//九宫格爬塔 小地图 3行3个
export function MiniMapPanel(){
    return (
        <Panel id={'mini_map1'} hittestchildren={false} style={{flowChildren:"down",align: "center center"}} >
                {[...Array(3).keys()].map((key1) => 
                    {return <Panel id={'card'+("layer"+key1)} hittestchildren={false} style={{flowChildren:"right",align: "center center"}} key={key1} >
                                {[...Array(3).keys()].map((key) => {return <CardPanel key={key} layer={key1} slot={key+1} />}) }
                            </Panel>
                    }
                )}
        </Panel>
    )
}  

  