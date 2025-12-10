import 'panorama-polyfill-x/lib/console';
import 'panorama-polyfill-x/lib/timers';
import type { FC } from 'react';
import React, { useState,useEffect,useRef,useCallback } from 'react';
import classNames from 'classnames';
import { render } from 'react-panorama-x';
import { CardPanel } from './components/card';
import { MainPanel } from './components/main';
import { UnitPanel } from './components/unit/unit_panel';

import { HealthBar } from './components/health_bar_above_unit';
// render(<CardPanel />, $('#card'));
import { BagPanel} from './components/bag';
import { BagCustomTooltip } from './components/bag_tooltip';
import { CustomDrag } from './components/custom_drag';
import { PuzzlePanel } from './components/test/puzzle';
import { ThePubicRegionPanel } from './components/test/the_pubic_region';

declare global {
    interface CDOTA_PanoramaScript_GameUI {
        global?: any;
    }
}


function GameState() {
    $.Msg('kaishiyunxing     ',Game.GetState())
    if(Game.GetState() == DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS){
	    GameUI.global = {};  //提前加载全局变量
		GameUI.global.mouse_unit;
		GameUI.global.MOVING_PCF;
		GameUI.global.branch == 'qidong'
		UpdateHeroIcon()
	    render(<CustomDrag/>,$('#drag'))
        render(<BagCustomTooltip/>, $('#tooltip'));
        render(<BagPanel />, $('#bag'));
        render(<MainPanel />, $('#main'));
		render(<ThePubicRegionPanel />, $('#puzzle'));
        //render(<PuzzlePanel/>, $('#puzzle'));
		//render(<UnitPanel />, $('#unit'));    //单位面板
        //HealthAboveUnit()   //血条
        return 
    }
    $.Schedule(1, GameState);
}
GameState()


//血条
let entityindex:EntityIndex | -1 = -1;
function HealthAboveUnit() {
    $.Schedule(0.1, HealthAboveUnit);
	if(entityindex == -1  && entityindex != Players.GetSelectedEntities(0)[0]){
		entityindex = Players.GetSelectedEntities(0)[0];
		$.Msg(entityindex)
		render(<HealthBar entityindex = {entityindex}  />, $('#card'));
	}
}

RegistersKeyBind('w')
RegistersKeyBind('a')
RegistersKeyBind('s')
RegistersKeyBind('d')
RegistersKeyBind('space')
RegistersKeyBind('f')
RegistersKeyBind('1')
RegistersKeyBind('2')
RegistersKeyBind('3')
RegistersKeyBind('q')
RegistersKeyBind('e')

function UpdateHeroIcon() {
    $.Schedule(0, UpdateHeroIcon);
	const cursorPosition = GameUI.GetCursorPosition();
	const gamePosition = Game.ScreenXYToWorld(cursorPosition[0], cursorPosition[1]);
    if(GameUI.global.branch == 'qidong'){
		const pos = GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition())
		GameEvents.SendCustomGameEventToServer<object>('Button',{key:'',button:'mouse_left',pos:pos})
	}
    if (GameUI.global.mouse_unit) {
		let PORTRAIT_UNIT = GameUI.global.mouse_unit
        const cursorPosition = GameUI.GetCursorPosition();
        const gamePosition = Game.ScreenXYToWorld(cursorPosition[0], cursorPosition[1]);
        const origin = Entities.GetAbsOrigin(PORTRAIT_UNIT);
        Particles.SetParticleControl(GameUI.global.MOVING_PCF, 5, [gamePosition[0], gamePosition[1], gamePosition[2]]);
        Particles.SetParticleControl(GameUI.global.MOVING_PCF, 2, [128, 128, 128]);
    }
}

function RegistersKeyBind(key:string){
    const command = `On${key}${Date.now()}`;
    Game.CreateCustomKeyBind(key, `+${command}`);
    Game.AddCommand(
        `+${command}`,
        () => {
            let pos = GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition())
            GameEvents.SendCustomGameEventToServer<object>('Button',{key:key,button:'down',pos:pos})
            // key down callback
        },
        ``,
        1 << 32
    );
    Game.AddCommand(
        `-${command}`,
        () => {
            GameEvents.SendCustomGameEventToServer<object>('Button',{key:key,button:'up'})
            // key up callback
        },
        ``,
        1 << 32
    );
}
GameUI.SetMouseCallback( function( eventName, arg ) {
	var CONSUME_EVENT = true;
	var CONTINUE_PROCESSING_EVENT = false;
	const pos = GameUI.GetCursorPosition();
	const world_pos =  Game.ScreenXYToWorld(pos[0],pos[1])
    $.Msg(world_pos)
	if ( GameUI.GetClickBehaviors() !== CLICK_BEHAVIORS.DOTA_CLICK_BEHAVIOR_NONE )
		return CONTINUE_PROCESSING_EVENT;

	if ( eventName == "pressed" )
	{
		// Left-click is move to position
		if ( arg === 0 )
		{
            let pos = GameUI.GetScreenWorldPosition(GameUI.GetCursorPosition())
            GameEvents.SendCustomGameEventToServer<object>('Button',{key:'',button:'mouse_left',pos:pos})
			return CONSUME_EVENT;
		}

		// Disable right-click
		if ( arg === 1 )
		{
			return CONSUME_EVENT;
		}
	}
	else if ( eventName === "wheeled" )
	{
		if ( arg < 0 )
		{

			return CONSUME_EVENT;		
		}
		else if ( arg > 0 )
		{

			return CONSUME_EVENT;		
		}
	}
	else if ( eventName === "released" )
	{
		return CONSUME_EVENT;		
	}
	else if ( eventName === "doublepressed" )
	{
		return CONSUME_EVENT;		
	}
    
    $.Msg(eventName, arg)
	return CONTINUE_PROCESSING_EVENT;
} );

