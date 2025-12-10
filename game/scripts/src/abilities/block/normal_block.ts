import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class normal_block extends BaseAbility {
    particle?: ParticleID;
    OnSpellStart() {
        const caster = this.GetCaster();
        const duration = this.GetSpecialValueFor("block_duration");
        caster.AddNewModifier( caster, this, "modifier_normal_block", { duration:duration });
        EmitSoundOn( "Hero_Sven.GodsStrength", caster )
        caster.AddActivityModifier('juggernaut_blade_fury')
        caster.StartGesture(GameActivity.DOTA_OVERRIDE_ABILITY_1)
        // caster.AddNewModifier( caster, this, "modifier_shop", { duration:0.2 });
    }
}
@registerModifier()
export class modifier_normal_block extends BaseModifier {
    // Run when modifier instance is created
    OnCreated(): void {
        if (IsServer()) {
            const nFXIndex = ParticleManager.CreateParticle( "particles/items3_fx/lotus_orb_shield.vpcf", ParticleAttachment.POINT_FOLLOW, this.GetParent() )
            ParticleManager.SetParticleControlEnt( nFXIndex, 0, this.GetParent(), ParticleAttachment.POINT_FOLLOW, "attach_hitloc" , this.GetParent().GetOrigin(), true )
            ParticleManager.SetParticleControlEnt( nFXIndex, ParticleAttachment.POINT_FOLLOW, this.GetParent(), 1, "attach_hitloc" , this.GetParent().GetOrigin(), true )
            this.AddParticle( nFXIndex, false, false, -1, false, true )
        }
    }
    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.TOTAL_CONSTANT_BLOCK,ModifierFunction.ON_TAKEDAMAGE]
    }   
    OnTakeDamage(keys): void {
        if (IsServer() ) {
            let attacker:CDOTA_BaseNPC = keys.attacker
            let caster = this.GetCaster()
            let ability = this.GetAbility()
            let parent = this.GetParent()
            if (attacker.GetTeamNumber() != caster.GetTeamNumber()){
                caster.AddNewModifier( caster, ability, "modifier_immune", { duration:0.3 } );
                caster.RemoveModifierByName('modifier_normal_block')
            }         
        }
    }
    GetModifierTotal_ConstantBlock(event: ModifierAttackEvent): number {
        return event.damage
    }
}

@registerModifier()
export class modifier_immune extends BaseModifier {
    OnCreated(): void {
        if (IsServer()) {
            const nFXIndex = ParticleManager.CreateParticle( "particles/econ/events/spring_2021/mjollnir_shield_spring_2021.vpcf", ParticleAttachment.POINT_FOLLOW, this.GetParent() )
            ParticleManager.SetParticleControlEnt( nFXIndex, 0, this.GetParent(), ParticleAttachment.POINT_FOLLOW, "attach_hitloc" , this.GetParent().GetOrigin(), true )
            ParticleManager.SetParticleControlEnt( nFXIndex, ParticleAttachment.POINT_FOLLOW, this.GetParent(), 1, "attach_hitloc" , this.GetParent().GetOrigin(), true )
            this.AddParticle( nFXIndex, false, false, -1, false, true )
        }
    }
    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.TOTAL_CONSTANT_BLOCK]
    }   
    GetModifierTotal_ConstantBlock(event: ModifierAttackEvent): number {
        return event.damage
    }
}


