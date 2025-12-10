import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_7 extends BaseAbility {
    OnSpellStart() {
        const caster = this.GetCaster();
        const point = this.GetCursorPosition();
        let direction = ((point - this.GetCaster().GetAbsOrigin()) as Vector).Normalized();
        direction.z = 0;
        this.GetCaster().SetForwardVector(direction)
        this.GetCaster().AddNewModifier(this.GetCaster(), this, "modifier_dagger_7", {duration:1})
        ProjectileManager.CreateLinearProjectile({
            Ability: this,
            EffectName: "",
            vSpawnOrigin: caster.GetAbsOrigin(),
            fDistance: 200,
            fStartRadius: 400,
            fEndRadius: 1000,
            Source: caster,
            bHasFrontalCone: false,
            iUnitTargetTeam: UnitTargetTeam.NONE,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            iUnitTargetType: UnitTargetType.NONE,
            vVelocity: (direction * 50) as Vector,
            bProvidesVision: true,
            iVisionRadius: 1000,
            iVisionTeamNumber: caster.GetTeamNumber(),
        });
    }
}

@registerModifier()
class modifier_dagger_7 extends BaseModifier {
    OnCreated(kv){
        if(IsServer()) {
            this.GetCaster().AddActivityModifier("centaur_double_edge") 
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
