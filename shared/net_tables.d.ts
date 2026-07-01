/// <reference types="@moddota/dota-lua-types/normalized" />
declare interface CustomNetTableDeclarations {
    game_timer: {
        game_timer: {
            current_time: number;
            current_state: 1 | 2 | 3 | 4 | 5;
            current_round: number;
        };
    };
    hero_list: {
        hero_list: Record<string, string> | string[];
    };
    custom_net_table_1: {
        key_1: number;
        key_2: string;
    };
    custom_net_table_3: {
        key_1: number;
        key_2: string;
    };
    bag: {
        [key: string]: {
            [slot: number]: CDOTA_Item | -1;
            switch?: boolean;
        };
    };
    wu_xing: {
        [key: string]:{
            gridData?: string[][]; // 玩家ID对应的元素列表
            initialRegion?: {           // 初始区域（可选，根据模式确定）
                startX: number;
                startY: number;
                rows: number;
                cols: number;
            };
            switch?: boolean;
        }
    };
}