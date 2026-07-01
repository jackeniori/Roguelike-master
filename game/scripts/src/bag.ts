/**
 * 背包类 (Bag)
 * 用于管理玩家的物品存储和操作
 */
class Bag {
    // 私有属性
    private __owner: CDOTA_BaseNPC; // 背包拥有者
    private __bag_name: string;     // 背包名称
    private __slot_count: number;   // 总格子数
    private __valid_slot_min_index: number; // 最小有效格子索引
    private __valid_slot_max_index: number; // 最大有效格子索引
    private __write_lock: boolean;  // 写入锁
    private __itemlist: {
        [key: number]: CDOTA_Item | -1; // 物品列表
        switch?: boolean; // 特殊开关属性
    };
    private __nettable_name: string; // NetTable名称

    /**
     * 构造函数
     * @param bagName 背包名称 
     * @param owner 背包拥有者
     * @param slot_count 总格子数
     * @param min_index 最小有效格子索引(可选)
     * @param max_index 最大有效格子索引(可选)
     */
    constructor(bagName: string, owner: any, slot_count: number, min_index?: number, max_index?: number) {
        this.__owner = owner;
        this.__bag_name = bagName;
        this.__slot_count = slot_count;
        this.__valid_slot_min_index = min_index || 1;
        this.__valid_slot_max_index = max_index || slot_count;
        this.__write_lock = false;

        // 初始化物品列表
        this.__itemlist = {};
        for (let i = 1; i <= slot_count; i++) {
            this.__itemlist[i] = -1; // -1表示空槽位
        }
        this.__itemlist.switch = false; // 特殊开关属性
        this.__nettable_name = bagName; // NetTable名称
    }

    /**
     * 获取背包名称
     * @returns 背包名称
     */
    public GetBagName(): string {
        return this.__bag_name;
    }

    /**
     * 获取最小有效格子索引
     * @returns 最小索引
     */
    public GetMin(): number {
        return this.__valid_slot_min_index;
    }

    /**
     * 获取最大有效格子索引
     * @returns 最大索引
     */
    public GetMax(): number {
        return this.__valid_slot_max_index;
    }

    /**
     * 设置最小有效格子索引
     * @param min 要设置的最小索引
     */
    public SetMin(min: number): void {
        if (min > this.__slot_count || min <= 0 || min >= this.GetMax()) {
            return;
        }
        this.__valid_slot_min_index = min;
    }

    /**
     * 设置最大有效格子索引
     * @param max 要设置的最大索引
     * @returns 是否设置成功
     */
    public SetMax(max: number): boolean {
        if (max > this.__slot_count || max <= 0 || max <= this.GetMin()) {
            return false;
        }
        this.__valid_slot_max_index = max;
        return true;
    }

    /**
     * 切换背包开关状态
     */
    public Switch(isEnabled?:boolean): void {
        if (isEnabled) {
            this.__itemlist.switch = isEnabled;
        } else if (this.__itemlist.switch === false) {
            this.__itemlist.switch = true;
        } else if (this.__itemlist.switch === true) {
            this.__itemlist.switch = false;
        }
        this.Update();
    }

    /**
     * 更新背包数据到NetTable
     */
    public Update(): void {
        //print('baglua,',this.__nettable_name)
        CustomNetTables.SetTableValue("bag", this.__nettable_name, this.__itemlist);
    }

    /**
     * 获取已使用的格子数量
     * @returns 已使用格子数
     */
    public GetCount(): number {
        const itemlist = this.__itemlist;
        const [min, max] = [this.GetMin(), this.GetMax()];
        let count = 0;

        for (let bagSlot = min; bagSlot <= max; bagSlot++) {
            const item = itemlist[bagSlot];
            if (item !== -1) {
                count++;
            }
        }

        return count;
    }

    /**
     * 判断背包是否已满
     * @returns 是否已满
     */
    public IsFull(): boolean {
        const valid_max_count = this.GetMax() - this.GetMin() + 1;
        return this.GetCount() === valid_max_count;
    }

    /**
     * 添加物品到背包
     * @param item 要添加的物品
     * @returns 是否添加成功
     */
    public AddItem(item: CDOTA_Item): boolean {
        if (this.IsFull()) {
            return false;
        }
        const bagSlot = this.GetNoUseSlot();
        if (bagSlot > 0) {
            this.__itemlist[bagSlot] = item;
            this.Update();
            return true;
        }

        return false;
    }

    /**
     * 获取第一个未使用的格子
     * @returns 格子索引，-1表示没有可用格子
     */
    public GetNoUseSlot(): number {
        const itemlist = this.__itemlist;
        const [min, max] = [this.GetMin(), this.GetMax()];

        for (let bagSlot = min; bagSlot <= max; bagSlot++) {
            const item = itemlist[bagSlot];
            if (item === -1) {
                return bagSlot;
            }
        }

        return -1;
    }

    /**
     * 拖拽交换物品位置
     * @param slot1 第一个格子
     * @param slot2 第二个格子
     * @returns 是否交换成功
     */
    public Drag(slot1: number, slot2: number): boolean {
        const itemlist = this.__itemlist;
        // 从格子拖拽到另一个格子
        if (slot1 && slot2) {
            [itemlist[slot1], itemlist[slot2]] = [itemlist[slot2], itemlist[slot1]];
        }
        this.Update();
        return true;
    }

    /**
     * 将物品拖拽到单位
     * @param unit 单位实体索引
     * @param slot 格子索引
     * @returns 是否操作成功
     */
    public DragToUnit(unit: EntityIndex, slot: number): boolean {
        const itemlist = this.__itemlist;
        const targetUnit = EntIndexToHScript(unit) as CDOTA_BaseNPC;
        
        const item = itemlist[slot];
        if (item !== -1) {
            targetUnit.AddAbility(item.GetAbilityName())?.SetLevel(1);
            itemlist[slot] = -1;
            this.Update();
            return true;
        }
        
        return false;
    }
}

export { Bag };