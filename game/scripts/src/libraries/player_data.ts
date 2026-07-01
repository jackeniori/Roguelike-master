import { Bag } from '../bag';

export interface PlayerData {
            IsFirstSpawnEntity: CDOTA_BaseNPC | null;
            // 简体中文注释：战棋单位的详细数据
            units: Array<{
                // 1. 基础信息
                unitID: string;            // 单位唯一ID
                templateID: string;        // 单位模板ID（如"步兵1"、"弓箭手2"）
                name: string;                           // 角色名称
                level: number;                          // 等级
                experience: number;                     // 经验值
                // 2. 丹田系统（核心）
                dantian: {
                    // 当前丹田网格
                    realm: string;                       // 当前境界：武者/武师/大师/宗师/武圣
                    gridSize: {                          // 丹田尺寸
                        rows: number;                    // 行数（3-5）
                        cols: number;                    // 列数（3-5）
                    };
                    
                    // 五行丹田格子
                    gridData: string[][];
                    
                    // 已选择的3x3起始区域
                    initialRegion: {
                        startX: number;                  // 起始X坐标
                        startY: number;                   // 起始Y坐标
                        size: number;                         // 固定3x3
                    };
                    
                    // 丹田统计数据
                    elementCounts: {                     // 各属性数量统计
                        metal: number;                   // 金
                        wood: number;                    // 木
                        water: number;                   // 水
                        fire: number;                    // 火
                        earth: number;                   // 土
                    };
                };
            }>;
            Ability: Record<string, string>;
            hero:{ PreviousNotice: number };
            bag:Bag;
            preinput: string;
            weapon: number;
            Key: string;
            state: {
                hero: boolean;
                grid:ParticleID;
            };
            grad_world:{
                x:number,
                y:number,
                width:number,
                height:number,
                origin:Vector,
                particle:{ [key: number] : ParticleID},
                vector: { [key: number] : { [key: number]: Vector } }
            };
}


export function createDefaultPlayerData(playerID: PlayerID): PlayerData {
    return {
        IsFirstSpawnEntity: null,
        units: [],
        Ability: {},
        hero: { PreviousNotice: 0 },
        bag: new Bag('player_' + playerID, PlayerResource.GetPlayer(playerID), 36, 1, 36),
        preinput: '',
        weapon: 1,
        Key: '',
        state: {
            hero: true,
            grid: null,
        },
        grad_world: {
            x: 0, y: 0, width: 0, height: 0,
            origin: Vector(0, 0, 128),
            particle: [],
            vector: []
        }
    };
}