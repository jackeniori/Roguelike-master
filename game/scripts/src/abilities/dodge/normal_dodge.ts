import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class normal_dodge extends BaseAbility {
    particle?: ParticleID;
    OnSpellStart() {
        if (IsServer()) {  
            const caster = this.GetCaster();
            const point = this.GetCursorPosition();
            caster.AddNewModifier( caster, this, "modifier_normal_dodge", { duration:0.2 });

            const nFXIndex = ParticleManager.CreateParticle( "particles/units/heroes/hero_queenofpain/queen_blink_start.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, caster )
            ParticleManager.SetParticleControlEnt( nFXIndex, 1, caster, ParticleAttachment.ABSORIGIN_FOLLOW, null, caster.GetOrigin(), true )
            ParticleManager.ReleaseParticleIndex( nFXIndex )
            
            const direction = ((point - caster.GetAbsOrigin()) as Vector).Normalized();
            direction.z = 0;
            const distance = (caster.GetAbsOrigin()+direction*350)as Vector;
            const nFXIndexEnd = ParticleManager.CreateParticle("particles/units/heroes/hero_queenofpain/queen_blink_end.vpcf", ParticleAttachment.ABSORIGIN, caster)
            ParticleManager.SetParticleControl(nFXIndexEnd, 0, distance)
            ParticleManager.SetParticleControlForward(nFXIndexEnd, 0, distance)
            ParticleManager.ReleaseParticleIndex(nFXIndexEnd)
            caster.SetOrigin(distance)
        }
    }

}
@registerModifier()
export class modifier_normal_dodge extends BaseModifier {
    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.TOTAL_CONSTANT_BLOCK]
    }   
    GetModifierTotal_ConstantBlock(event: ModifierAttackEvent): number {
        return event.damage
    }
}
