import React, { useState,useEffect,useRef } from "react";
import { render, useGameEvent, useNetTableKey, useRegisterForUnhandledEvent } from 'react-panorama-x';

export function CardPanel({data,slot}:any){
    return (
        <Panel id={slot} hittestchildren={false} 
            style={{flowChildren:"down",height:'250px',width:'200px',border:'1px solid #000000',backgroundColor:'#ffffff',fontSize:'20px'}} >
        </Panel>
    )
}  
