// 定义五行属性常量
const elements = ['metal', 'wood', 'water', 'fire', 'earth'] as const;
type elements = typeof elements[number];
// 定义灵根类型
type GenusType = "Tian" | "Di" | "Shuang" | "San" | "Si" | "Wu";

/**
 * 根据灵根类型生成丹田网格
 * @param genusType 灵根类型
 * @param mainElements 主属性数组（长度需与灵根类型匹配）
 * @returns 5x5网格数组
 */
export function GenerateDantian(genusType: GenusType, mainElements: elements[]): elements[][] {
    // 验证主属性数组长度是否符合灵根类型要求
    switch (genusType) {
        case "Tian":
            if (mainElements.length !== 1) throw new Error("天灵根必须指定一个主属性");
            break;
        case "Di":
            if (mainElements.length !== 1) throw new Error("地灵根必须指定一个主属性");
            break;
        case "Shuang":
            if (mainElements.length !== 2) throw new Error("双灵根必须指定两个主属性");
            break;
        case "San":
            if (mainElements.length !== 3) throw new Error("三灵根必须指定三个主属性");
            break;
        case "Si":
            if (mainElements.length !== 4) throw new Error("四灵根必须指定四个主属性");
            break;
        case "Wu":
            if (mainElements.length !== 5) throw new Error("五灵根必须指定所有五个属性");
            break;
        default:
            throw new Error("未知的灵根类型");
    }

    // 初始化属性计数器
    const elementCounts: Record<elements, number> = {
        metal: 0,
        wood: 0,
        water: 0,
        fire: 0,
        earth: 0
    };

    const totalCells = 25; // 5x5网格总格数

    switch (genusType) {
        case "Tian":
            elementCounts[mainElements[0]] = 16;
            distributeRemainingCells(elementCounts, elements.filter(e => e !== mainElements[0]), totalCells - 16);
            break;

        case "Di":
            elementCounts[mainElements[0]] = 13;
            distributeRemainingCells(elementCounts, elements.filter(e => e !== mainElements[0]), totalCells - 13);
            break;

        case "Shuang":
            mainElements.forEach(e => elementCounts[e] = 7);
            distributeRemainingCells(elementCounts, elements.filter(e => !mainElements.includes(e)), totalCells - 14);
            break;

        case "San":
            const remainingElements = elements.filter(e => !mainElements.includes(e));
            // 主属性共19格，按7:6:6分配
            elementCounts[mainElements[0]] = 7;
            elementCounts[mainElements[1]] = 6;
            elementCounts[mainElements[2]] = 6;
            distributeRemainingCells(elementCounts, remainingElements, totalCells - 19);
            break;

        case "Si":
            const missingElement = elements.find(e => !mainElements.includes(e))!;
            // 主属性共23格，按6:6:6:5分配
            elementCounts[mainElements[0]] = 6;
            elementCounts[mainElements[1]] = 6;
            elementCounts[mainElements[2]] = 6;
            elementCounts[mainElements[3]] = 5;
            elementCounts[missingElement] = 2; // 缺失属性占2格
            break;

        case "Wu":
            // 每种属性4-6格，共25格
            const baseCount = 5; // 每种属性基础5格
            elements.forEach(e => elementCounts[e] = baseCount);
            
            // 随机分配剩余的格子
            const shuffledElements = [...elements].sort(() => Math.random() - 0.5);
            for (let i = 0; i < totalCells - baseCount * 5; i++) {
                elementCounts[shuffledElements[i]]++;
            }
            break;
    }

    // 创建并打乱属性数组
    let allElements: elements[] = [];
    for (const e of elements) {
        for (let i = 0; i < elementCounts[e]; i++) {
            allElements.push(e);
        }
    }
    allElements = shuffleArray(allElements);

    // 填充到5x5网格（使用1-based索引）
    const grid: elements[][] = [];
    for (let i = 0; i < 5; i++) {
        grid[i] = [];
        for (let j = 0; j < 5; j++) {
            grid[i][j] = allElements.pop()!;
        }
    }

    return grid;
}

/**
 * 辅助函数：分配剩余格子给指定属性
 */
function distributeRemainingCells(counts: Record<elements, number>, elementsList: elements[], remaining: number): void {
    const baseCount = Math.floor(remaining / elementsList.length);
    const extra = remaining - baseCount * elementsList.length;
    
    elementsList.forEach(e => counts[e] = baseCount);
    
    // 随机分配额外格子
    const shuffled = [...elementsList].sort(() => Math.random() - 0.5);
    for (let i = 0; i < extra; i++) {
        counts[shuffled[i]]++;
    }
}

/**
 * 辅助函数：随机打乱数组
 */
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
