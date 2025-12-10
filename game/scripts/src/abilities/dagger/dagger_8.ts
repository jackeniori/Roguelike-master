import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_8 extends BaseAbility {
    OnSpellStart() {
        const caster = this.GetCaster();
        const point = this.GetCursorPosition();
        let direction = ((point - caster.GetAbsOrigin()) as Vector).Normalized();
        direction.z = 0;
        caster.SetForwardVector(direction)
        caster.AddNewModifier(caster, this, "modifier_dagger_8", {duration:1})
    }
}

@registerModifier()
class modifier_dagger_8 extends BaseModifier {
    OnCreated(kv){
        if(IsServer()) {
            this.GetCaster().AddActivityModifier("monkey_king_boundless_strike") 
            this.GetCaster().StartGesture(GameActivity.DOTA_CAST_ABILITY_5)
        }
    }

    OnDestroy(){
        if(IsServer()) {
            this.GetCaster().FadeGesture(GameActivity.DOTA_CAST_ABILITY_5)
            this.GetCaster().ClearActivityModifiers()
        }
    }
}
