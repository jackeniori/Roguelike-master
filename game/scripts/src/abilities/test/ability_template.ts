import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class normal_test extends BaseAbility {
    OnSpellStart() {
        const caster = this.GetCaster();
        const point = this.GetCursorPosition();
    }
}

@registerModifier()
class modifier_normal_test extends BaseModifier {
    OnCreated(kv){
        if(IsServer()) {
        }
    }

    OnDestroy(){
        if(IsServer()) {
        }
    }
}
