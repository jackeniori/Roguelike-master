// 引入 ModDota 生态的类型定义（例如来自 @moddota/dota-data 或 panarama-types）
// 注意：以下为模拟代码，实际导入路径需根据项目配置调整。

/**
 * 五行元素类型
 */
type WuXingElement = 'metal' | 'wood' | 'water' | 'fire' | 'earth';

/**
 * 元素生成配置
 */
interface ElementGenerationConfig {
    metal?: number;
    wood?: number;
    water?: number;
    fire?: number;
    earth?: number;
}

/**
 * 一个基于 Dota 2 游戏模式的五行元素生成器
 * 假设这个类将被挂载到游戏逻辑中
 */
class WuXingElementGenerator {
    // 常量定义：符合 Dota 技能数值设计习惯
    private static readonly MIN_COUNT_PER_ELEMENT: number = 2;
    private static readonly MAX_COUNT_PER_ELEMENT: number = 15;
    private static readonly TOTAL_GRID_CELLS: number = 25; // 5x5 丹田网格

    private readonly elements: WuXingElement[] = ['metal', 'wood', 'water', 'fire', 'earth'];

    /**
     * 生成元素数组。此方法可能由游戏事件触发，例如英雄学习技能时。
     * @param config 可选的数量配置
     * @returns 随机排序的元素数组，长度恒为25
     */
    public GenerateForDantian(config: ElementGenerationConfig = {}): WuXingElement[] {
        // 1. 验证配置（在游戏开发中，严谨的资源验证很重要）
        this.validateConfig(config);

        // 2. 计算最终的元素分布
        const distribution = this.calculateDistribution(config);

        // 3. 创建并打乱数组（使用游戏开发中常用的 Fisher-Yates 算法）
        const elementArray = this.createAndShuffleArray(distribution);

        // 4. （可选）在游戏内发送事件或生成视觉特效
        // this.fireElementGeneratedEvent(elementArray);

        return elementArray;
    }
    /**
     * 生成五行元素的5x5网格。此方法可能由游戏事件触发，例如英雄学习技能时。
     * 内部复用 GenerateForDantian 方法生成元素数组，然后转换为网格格式。
     * @param config 可选的数量配置
     * @returns 五行元素的5x5网格
     */
    public GenerateDantianGrid(config: ElementGenerationConfig = {}): WuXingElement[][] {
        // 复用 GenerateForDantian 生成25个元素的数组
        const elementArray = this.GenerateForDantian(config);
        
        // 将一维数组转换为5x5二维网格
        const grid: WuXingElement[][] = [];
        
        // 每5个元素作为一行
        for (let i = 0; i < 5; i++) {
            const startIndex = i * 5;
            const endIndex = startIndex + 5;
            grid[i] = elementArray.slice(startIndex, endIndex);
        }
        
        return grid;
    }
    /**
     * 验证配置的合法性。如果失败，在Dota模组开发中可能以打印错误或抛出异常的形式处理。
     */
    private validateConfig(config: ElementGenerationConfig): void {
        let specifiedCount = 0;
        for (const element of this.elements) {
            const count = config[element] || 0;
            if (count > WuXingElementGenerator.MAX_COUNT_PER_ELEMENT) {
                // 在 Dota 控制台输出错误信息
                print(`[五行生成器 错误] ${element} 数量 ${count} 超过最大值 ${WuXingElementGenerator.MAX_COUNT_PER_ELEMENT}。`);
                // 或者抛出错误，由上层游戏逻辑捕获
                throw new Error(`元素配置无效: ${element}`);
            }
            specifiedCount += count;
        }
        // ... 其他验证逻辑（如最小值、总和检查）与之前讨论类似
        if (specifiedCount > WuXingElementGenerator.TOTAL_GRID_CELLS) {
            throw new Error(`指定的元素总数 (${specifiedCount}) 超过网格容量。`);
        }
    }

    /**
     * 计算每个元素的具体数量。
     */
    private calculateDistribution(config: ElementGenerationConfig): Record<WuXingElement, number> {
        const distribution: Record<WuXingElement, number> = {
            metal: config.metal || 0,
            wood: config.wood || 0,
            water: config.water || 0,
            fire: config.fire || 0,
            earth: config.earth || 0,
        };
        // ... 具体的分配算法（保证最小值、随机分配剩余额度）与之前讨论的核心逻辑一致
        // 此处省略详细实现步骤...

        return distribution; // 应确保总和为25
    }

/**
 * 创建数组并洗牌。
 * 如果传入的分布无效（总数为0），则自动生成随机分布。
 */
private createAndShuffleArray(distribution: Record<WuXingElement, number>): WuXingElement[] {
    // 检查分布是否有效
    const totalCount = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    // 如果总数为0，则创建一个随机分布
    if (totalCount === 0) {
        distribution = this.generateRandomDistribution();
    }
    
    // 如果总数不等于25，进行调整
    if (totalCount !== WuXingElementGenerator.TOTAL_GRID_CELLS && totalCount !== 0) {
        distribution = this.adjustDistribution(distribution);
    }
    
    const array: WuXingElement[] = [];
    
    // 根据分布创建数组
    for (const [element, count] of Object.entries(distribution)) {
        for (let i = 0; i < count; i++) {
            array.push(element as WuXingElement);
        }
    }
    
    // 确保数组长度为25
    if (array.length !== WuXingElementGenerator.TOTAL_GRID_CELLS) {
        print(`[五行生成器 错误] 数组长度异常: ${array.length}，强制调整为25。`);
        return this.generateFallbackArray();
    }
    
    // Fisher-Yates 洗牌算法
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    
    return array;
}

/**
 * 生成一个随机分布（每种元素至少2个，最多不超过15个，总数25）
 */
private generateRandomDistribution(): Record<WuXingElement, number> {
    const distribution: Record<WuXingElement, number> = {
        metal: WuXingElementGenerator.MIN_COUNT_PER_ELEMENT,
        wood: WuXingElementGenerator.MIN_COUNT_PER_ELEMENT,
        water: WuXingElementGenerator.MIN_COUNT_PER_ELEMENT,
        fire: WuXingElementGenerator.MIN_COUNT_PER_ELEMENT,
        earth: WuXingElementGenerator.MIN_COUNT_PER_ELEMENT
    };
    
    // 已分配10个（5种元素 × 最小数量2）
    let remaining = WuXingElementGenerator.TOTAL_GRID_CELLS - 10;
    
    // 随机分配剩余的15个位置，同时确保不超过单种元素的最大值
    while (remaining > 0) {
        // 1. 过滤出当前计数尚未达到最大值的元素
        const availableElements = this.elements.filter(
            element => distribution[element] < WuXingElementGenerator.MAX_COUNT_PER_ELEMENT
        );
        
        // 安全检查：理论上在总数为25、最大值15、最小值2的约束下，此情况不应发生。
        // 但为了代码健壮性，若发生则跳出循环。
        if (availableElements.length === 0) {
            print(`[五行生成器 警告] 所有元素已达上限 ${WuXingElementGenerator.MAX_COUNT_PER_ELEMENT}，但仍有 ${remaining} 个位置待分配。`);
            break;
        }
        
        // 2. 从可用的元素中随机选择一个
        const randomIndex = Math.floor(Math.random() * availableElements.length);
        const chosenElement = availableElements[randomIndex];
        
        // 3. 为该元素计数加一
        distribution[chosenElement]++;
        remaining--;
    }
    
    // 最终验证（可选，用于调试）
    // this.validateFinalDistribution(distribution);
    
    return distribution;
}

/**
 * 调整分布使总数等于25
 */
private adjustDistribution(distribution: Record<WuXingElement, number>): Record<WuXingElement, number> {
    const currentTotal = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const difference = WuXingElementGenerator.TOTAL_GRID_CELLS - currentTotal;
    
    if (difference === 0) {
        return distribution;
    }
    
    const adjustedDistribution = { ...distribution };
    
    if (difference > 0) {
        // 需要添加元素
        for (let i = 0; i < difference; i++) {
            const randomElement = this.elements[Math.floor(Math.random() * this.elements.length)];
            adjustedDistribution[randomElement]++;
        }
    } else {
        // 需要移除元素（但确保每种元素至少有最小数量）
        let toRemove = Math.abs(difference);
        const availableElements = this.elements.filter(
            element => adjustedDistribution[element] > WuXingElementGenerator.MIN_COUNT_PER_ELEMENT
        );
        
        while (toRemove > 0 && availableElements.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableElements.length);
            const elementToReduce = availableElements[randomIndex];
            
            if (adjustedDistribution[elementToReduce] > WuXingElementGenerator.MIN_COUNT_PER_ELEMENT) {
                adjustedDistribution[elementToReduce]--;
                toRemove--;
                
                // 如果该元素已达最小数量，从可用列表中移除
                if (adjustedDistribution[elementToReduce] === WuXingElementGenerator.MIN_COUNT_PER_ELEMENT) {
                    availableElements.splice(randomIndex, 1);
                }
            }
        }
    }
    
    return adjustedDistribution;
}

/**
 * 生成一个备用数组（当所有其他方法都失败时使用）
 */
private generateFallbackArray(): WuXingElement[] {
    // 创建一个固定的备用数组（每种元素5个）
    const fallbackArray: WuXingElement[] = [];
    for (const element of this.elements) {
        for (let i = 0; i < 5; i++) {
            fallbackArray.push(element);
        }
    }
    
    // 打乱数组
    for (let i = fallbackArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fallbackArray[i], fallbackArray[j]] = [fallbackArray[j], fallbackArray[i]];
    }

    return fallbackArray;
}
    /**
     * （模拟）触发一个游戏内事件，通知其他系统五行已生成。
     * 这是 Dota 模组开发中常见的通信模式。
     */
    private fireElementGeneratedEvent(elementArray: WuXingElement[]): void {
        // 使用 Dota 2 的自定义事件系统
        const eventData: NetworkedData<{ elements: WuXingElement[] }> = {
            elements: elementArray,
        };
        // 此处为模拟代码，实际应使用如 `CustomGameEventManager.Send_ServerToAllClients` 等方法
        print(`五行元素已生成。第一个元素: ${elementArray[0]}`);
    }
}

export { WuXingElement, ElementGenerationConfig,WuXingElementGenerator };