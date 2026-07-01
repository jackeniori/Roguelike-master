// 定义 KV 文件的顶层结构（根据你的实际格式调整）
interface MartialArtsKV {
    XLSXContent: Record<string, any>;   // key 是功法ID，value 是对应数据
}

interface InnerArtData {
    displayName: string;
    abilityId: number;
    artType: string;
    grade: string;
    elementRequirements: Record<string, number>;
    duration: number;
    attackDamageBonusPercent: number;
    healthBonus: number;
    manaBonus: number;
}

function loadInnerArt(kvKey: string, rawData: any): InnerArtData {
    // 解析元素需求字符串 "fire:2,earth:1" → { fire: 2, earth: 1 }
    const elementReqs: Record<string, number> = {};
    if (rawData.elementRequirements) {
        const reqStr = rawData.elementRequirements as string;
        reqStr.split(",").forEach(pair => {
            const [elem, count] = pair.split(":");
            if (elem && count) elementReqs[elem.trim()] = parseInt(count.trim());
        });
    }

    return {
        displayName: rawData.DisplayName || kvKey,
        abilityId: parseInt(rawData.abilityId || "0"),
        artType: rawData.artType || "",
        grade: rawData.grade || "",
        elementRequirements: elementReqs,
        duration: parseFloat(rawData.duration || "-1"),
        attackDamageBonusPercent: parseFloat(rawData.attackDamageBonusPercent || "0"),
        healthBonus: parseFloat(rawData.healthBonus || "0"),
        manaBonus: parseFloat(rawData.manaBonus || "0"),
    };
}

function Test1(){
    const InnerArtskvData = LoadKeyValues("scripts/npc/inner_arts.txt");
    if (InnerArtskvData) {
        // 遍历所有内功
        for (const key of Object.keys(InnerArtskvData)) {
            const art = loadInnerArt(key, InnerArtskvData[key]);
            print(`功法: ${art.displayName}, 品阶: ${art.grade}`);
        }
    }
}
export { Test1 };
