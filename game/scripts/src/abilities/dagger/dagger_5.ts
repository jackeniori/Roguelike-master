import { BaseAbility, registerAbility,BaseModifier, registerModifier  } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_5 extends BaseAbility {
    particle?: ParticleID;
    OnAbilityPhaseStart(){
        const caster = this.GetCaster();
        caster.AddNewModifier(caster, this, "modifier_dagger_5", {duration:2})
        return true
    }
    OnSpellStart() {
        if(IsServer()) {
            let caster = this.GetCaster();
            let point = caster.GetCursorPosition()
            let direction = ((point - caster.GetAbsOrigin()) as Vector).Normalized();
            direction.z = 0;
            caster.SetForwardVector(direction)
            this.particle = ParticleManager.CreateParticle(
                'particles/econ/items/keeper_of_the_light/kotl_ti10_immortal/kotl_ti10_blinding_light.vpcf',
                ParticleAttachment.CUSTOMORIGIN,
                caster,
            );
            ParticleManager.SetParticleControl(this.particle, 0, caster.GetAbsOrigin());
            ParticleManager.SetParticleControl(this.particle, 1, caster.GetAbsOrigin()); 
        }
    }
    OnAbilityPhaseInterrupted(){
        if(IsServer()) {
            let caster = this.GetCaster();
            let point = caster.GetCursorPosition()
            let direction = ((point - caster.GetAbsOrigin()) as Vector).Normalized();
            direction.z = 0;
            caster.SetForwardVector(direction)
            this.particle = ParticleManager.CreateParticle(
                'particles/econ/items/keeper_of_the_light/kotl_ti10_immortal/kotl_ti10_blinding_light.vpcf',
                ParticleAttachment.CUSTOMORIGIN,
                caster,
            );
            ParticleManager.SetParticleControl(this.particle, 0, caster.GetAbsOrigin());
            ParticleManager.SetParticleControl(this.particle, 1, caster.GetAbsOrigin()); 
            this.GetCaster().RemoveModifierByName("modifier_dagger_5")
        }
    }
}


@registerModifier()
class modifier_dagger_5 extends BaseModifier {
    OnCreated(kv){
        if(IsServer()) {
            this.GetCaster().AddActivityModifier("bramble_maze")   //     juggernaut_blade_fury
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