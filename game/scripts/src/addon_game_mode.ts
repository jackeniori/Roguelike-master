import 'utils/index';
import { ActivateModules } from './modules';
import Precache from './utils/precache';

Object.assign(getfenv(), {
    Activate: () => {
        ActivateModules();
    },
    Precache: Precache

});

CustomGameEventManager.RegisterListener( "drag", Drag )  
/**
 * 处理UI拖拽交互
 * @param this 当前UI上下文
 * @param userId 事件索引
 * @param event 拖拽数据
 */
function Drag(this: void, userId: EntityIndex, event: {
    PlayerID: PlayerID;
    panel1: string;
    panel2: string;
    unit?: number; // 可选，当拖拽到单位时存在
}): void {
    const PlayerID = event.PlayerID;
    const PlayerData = GameRules.Addon.players[PlayerID];
    const [key1, key2] = [event.panel1, event.panel2];
    
    // 解析拖拽面板ID（格式："类型-编号"）
    const parsePanelId = (id: string): { type: string; index: number } | null => {
        const separatorPos = id.indexOf('-');
        if (separatorPos === -1) return null;
        
        return {
            type: id.substring(0, separatorPos),
            index: Number(id.substring(separatorPos + 1))
        };
    };
    const panel1 = parsePanelId(key1);
    const panel2 = parsePanelId(key2);
    // 处理面板间拖拽
    if (panel1 && panel2) {PlayerData.bag.Drag(panel1.index, panel2.index);}
}
