import { BaseAbility, registerAbility,BaseModifier, registerModifier  } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_6 extends BaseAbility {
    dash: ParticleID;
    OnSpellStart() {
        if(IsServer()) {
            let point = this.GetCaster().GetCursorPosition()
            let direction = ((point - this.GetCaster().GetAbsOrigin()) as Vector).Normalized();
            direction.z = 0;
            this.GetCaster().SetForwardVector(direction)
            this.GetCaster().AddNewModifier(this.GetCaster(), this, "modifier_dagger_6", {duration:1})
            let particle_cast = "particles/axe_attack.vpcf"
            this.dash = ParticleManager.CreateParticleForPlayer( particle_cast, ParticleAttachment.ABSORIGIN_FOLLOW, this.GetCaster(), this.GetCaster().GetPlayerOwner() )
            ParticleManager.SetParticleControl( this.dash, 0, this.GetCaster().GetOrigin() )
        }
    }
}
@registerModifier()
export class modifier_dagger_6 extends BaseModifier {
    OnCreated(kv){
        if(IsServer()) {
            this.GetCaster().AddActivityModifier("mars_arena_of_blood") 
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
