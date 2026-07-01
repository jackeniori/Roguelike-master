import { WuXingElement, ElementGenerationConfig,WuXingElementGenerator } from './wuxing';
// unit.ts
// 简体中文注释：单位管理类，用于管理战棋游戏中的角色单位
/**
 * 单位基础信息接口
 */
interface UnitBaseInfo {
    unitID: string;           // 单位唯一ID
    name: string;            // 单位名称
    isActive: boolean;       // 单位是否活跃（未死亡）
}
// 单位数据
    interface UnitData  {
        // 基础信息
        unitID: string;
        name: string;
        isActive: boolean;  // 单位是否活跃（未死亡）
        
        // 丹田系统
        dantian: {
            realm: number;              // 当前境界
            gridSize?: {                // 丹田尺寸（可选，根据模式确定）
                rows: number;
                cols: number;
            };
            gridCells: WuXingElement[][];  // 丹田网格
            initialRegion?: {           // 初始区域（可选，根据模式确定）
                startX: number;
                startY: number;
                rows: number;
                cols: number;
            };
            elementCounts: {           // 五行统计
                metal: number;
                wood: number;
                water: number;
                fire: number;
                earth: number;
            };
        };
        
        // 属性
        attributes: UnitAttributes;
        
        // 战斗状态
        battleStatus: {
            remainingAP: number;    // 剩余行动力
            buffs: {[buffID: string]: {duration: number; stacks: number}}; // Buff列表
        };
    };

/**
 * 单位属性接口
 */
interface UnitAttributes {
    // 基础属性
    attackPower: number;     // 攻击力
    speed: number;           // 速度
    health: {                // 生命值
        current: number;
        max: number;
    };
    internalEnergy: {        // 内力值
        current: number;
        max: number;
    };
}


// 境界与丹田尺寸的映射表
const REALM_GRID_SIZE_MAP: {[realm: number]: {rows: number, cols: number} | Array<{rows: number, cols: number}>} = {
    1: {rows: 3, cols: 3},  // 武者境: 3x3
    2: [{rows: 3, cols: 4}, {rows: 4, cols: 3}],  // 武师境: 3x4
    3: [{rows: 3, cols: 5}, {rows: 4, cols: 4}],  // 大师境: 3x5 或 4x4
    4: [{rows: 4, cols: 5}, {rows: 5, cols: 4}],  // 宗师境: 4x5
    5: {rows: 5, cols: 5}   // 武圣境: 5x5
};
/**
 * 战棋单位类
 * 精简版，只保留核心功能
 */
class GameUnit {
    // 私有属性
    private __owner: CDOTA_BaseNPC;      // 单位拥有者（英雄实体）
    private __unit_name: string;         // 单位名称
    private __unit_id: string;           // 单位唯一ID
    
    // 单位数据
    private __unit_data: UnitData;
    
    /**
     * 构造函数
     * @param owner 单位拥有者
     * @param unitName 单位名称
     * @param initialRealm 初始境界（默认1-武者）
     */
    constructor(
        owner: CDOTA_BaseNPC, 
        unitName?: string, 
        initialRealm: number = 1,
        customInitialRegion?: {    // ← 新增：可选的自定义区域参数
            startX: 1 | 2 | 3 | 4 | 5;  // 根据境界限制起始点范围
            startY: 1 | 2 | 3 | 4 | 5;  // 根据境界限制起始点范围
            rows: 3 | 4 | 5;  // 根据境界限制区域尺寸
            cols: 3 | 4 | 5;  // 根据境界限制区域尺寸
        },
        customGridSize?: {         // ← 新增：可选的自定义尺寸参数
            rows: 3 | 4 | 5;
            cols: 3 | 4 | 5;
        }
    ) {
        this.__owner = owner;
        this.__unit_name = unitName;
        this.__unit_id = this.generateUnitID(owner.GetEntityIndex().toString());
        
        // 根据参数创建单位数据
        this.__unit_data = this.createFlexibleUnitData(
            initialRealm, 
            //isRandom,  // ← 传递随机标志
            customInitialRegion, 
            customGridSize
        );
    }

    /**
     * 灵活创建单位数据
     * @param initialRealm 初始境界
     * @param customInitialRegion 可选，自定义初始区域
     * @param customGridSize 可选，自定义丹田尺寸
     */
    private createFlexibleUnitData(
        initialRealm: number,
        customInitialRegion?: {startX: number, startY: number, rows: number, cols: number},
        customGridSize?: {rows: number, cols: number}
    ): UnitData {
        // 1. 生成丹田网格（始终需要）
        const gridCells = new WuXingElementGenerator().GenerateDantianGrid();
        
        // 2. 确定丹田尺寸：优先使用自定义，否则根据境界计算
        const gridSize = customGridSize || this.getGridSizeByRealm(initialRealm);
        
        let initialRegion: {startX: number, startY: number, rows: number, cols: number};
        let elementCounts: {metal: number, wood: number, water: number, fire: number, earth: number};
        
        // 3. 确定初始区域
        if (customInitialRegion) {
            // 自定义区域模式：使用用户提供的区域
            initialRegion = customInitialRegion;
        } else {
            // 默认模式：居中显示
            initialRegion = {
                startX: Math.floor((5 - gridSize.cols) / 2),  // 在5x5网格中居中
                startY: Math.floor((5 - gridSize.rows) / 2),
                rows: gridSize.rows,
                cols: gridSize.cols
            };
        }
        
        // 4. 计算五行统计
        elementCounts = this.calculateElementCountsInRegion(gridCells, initialRegion);
        
        // 5. 返回完整单位数据
        return {
            unitID: this.__unit_id,
            name: this.__unit_name,
            isActive: true,
            dantian: {
                realm: initialRealm,
                gridSize: gridSize,
                gridCells: gridCells,
                initialRegion: initialRegion,
                elementCounts: elementCounts
            },
            // 属性
            attributes: {
                attackPower: 10 + (initialRealm - 1) * 2,  // 境界越高基础攻击力越高
                speed: 5 + (initialRealm - 1) * 1,
                health: {
                    current: 100 + (initialRealm - 1) * 20,
                    max: 100 + (initialRealm - 1) * 20
                },
                internalEnergy: {
                    current: 50 + (initialRealm - 1) * 10,
                    max: 50 + (initialRealm - 1) * 10
                }
            },
            // 战斗状态
            battleStatus: {
                remainingAP: 3 + Math.floor(initialRealm / 2),  // 境界越高初始行动力越多
                buffs: {}
            },
        };
    }
    /**
     * 计算指定区域内的五行统计
     */
    private calculateElementCountsInRegion(
        gridCells: WuXingElement[][],
        region: {startX: number, startY: number, rows: number, cols: number}
    ): {metal: number, wood: number, water: number, fire: number, earth: number} {
        const elementCounts = {metal: 0, wood: 0, water: 0, fire: 0, earth: 0};
        
        for (let row = region.startY; row < region.startY + region.rows && row < gridCells.length; row++) {
            for (let col = region.startX; col < region.startX + region.cols && col < gridCells[row].length; col++) {
                const element = gridCells[row][col];
                switch(element) {
                    case "metal": elementCounts.metal++; break;
                    case "wood": elementCounts.wood++; break;
                    case "water": elementCounts.water++; break;
                    case "fire": elementCounts.fire++; break;
                    case "earth": elementCounts.earth++; break;
                }
            }
        }
        
        return elementCounts;
    }
    /**
     * 生成单位唯一ID
     */
    private generateUnitID(ownerIndex: string): string {
        return `${ownerIndex}_${GameRules.GetGameTime()}_${RandomInt(0, 9999)}`;
    }
    /**
     * 根据境界获取丹田尺寸
     */
    private getGridSizeByRealm(realmLevel: number): {rows: number, cols: number} {
        const sizeConfig = REALM_GRID_SIZE_MAP[realmLevel];
        
        if (!sizeConfig) {
            // 默认返回武者境尺寸
            return {rows: 3, cols: 3};
        }
        
        // 处理大师境的多种可能
        if (Array.isArray(sizeConfig)) {
            // 随机选择一种配置
            const randomIndex = Math.floor(Math.random() * sizeConfig.length);
            return sizeConfig[randomIndex];
        }
        
        return sizeConfig;
    }
    /**
     * 获取单位ID
     */
    public GetUnitID(): string {
        return this.__unit_id;
    }
    
    /**
     * 获取单位名称
     */
    public GetUnitName(): string {
        return this.__unit_name;
    }
    
    /**
     * 获取单位拥有者
     */
    public GetOwner(): CDOTA_BaseNPC {
        return this.__owner;
    }
    
    /**
     * 更新单位数据到NetTable
     */
    public Update(): void {
        //CustomNetTables.SetTableValue("units", this.__nettable_name, this.__unit_data);
    }
    
    /**
     * 获取单位完整数据
     */
    public GetUnitData(): UnitData{
        return {...this.__unit_data};  // 返回副本
    }
    /**
     * 设置单位属性
     * @param attribute 属性名称
     * @param value 属性值
     */
    public SetAttribute(attribute: keyof UnitAttributes, value: any): boolean {
        if (attribute in this.__unit_data.attributes) {
            (this.__unit_data.attributes as any)[attribute] = value;
            this.Update();
            return true;
        }
        
        return false;
    }
    
    /**
     * 获取单位属性
     */
    public GetAttribute(attribute: keyof UnitAttributes): any {
        return (this.__unit_data.attributes as any)[attribute];
    }
    
    /**
     * 检查单位是否存活
     */
    public IsAlive(): boolean {
        return this.__unit_data.isActive && this.__unit_data.attributes.health.current > 0;
    }
    
}



export { GameUnit };