import { BaseAbility, registerAbility } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_1 extends BaseAbility {
    particle?: ParticleID;
    OnAbilityPhaseStart() {
        if (IsServer()) {
            this.GetCaster().EmitSound("Hero_Meepo.Earthbind.Cast");
        }

        return true;
    }

    OnAbilityPhaseInterrupted() {
        this.GetCaster().StopSound("Hero_Meepo.Earthbind.Cast");
    }

    OnSpellStart() {
        const caster = this.GetCaster();
        const point = this.GetCursorPosition();
        const projectileSpeed = this.GetSpecialValueFor("speed");

        const direction = ((point - caster.GetAbsOrigin()) as Vector).Normalized();
        direction.z = 0;
        // const distance = ((point - caster.GetAbsOrigin()) as Vector).Length();
        caster.SetForwardVector(direction)
        const radius = this.GetSpecialValueFor("radius");
        this.particle = ParticleManager.CreateParticle(
            "particles/riki_attack.vpcf",
            ParticleAttachment.CUSTOMORIGIN,
            caster,
        );

        ParticleManager.SetParticleControl(this.particle, 0, caster.GetAbsOrigin());
        ParticleManager.SetParticleControl(this.particle, 1, (caster.GetAbsOrigin()+direction*200) as Vector);
        ParticleManager.SetParticleControl(this.particle, 2, Vector(projectileSpeed, 0, 0));

        ProjectileManager.CreateLinearProjectile({
            Ability: this,
            EffectName: "",
            vSpawnOrigin: caster.GetAbsOrigin(),
            fDistance: 200,
            fStartRadius: radius,
            fEndRadius: radius,
            Source: caster,
            bHasFrontalCone: false,
            iUnitTargetTeam: UnitTargetTeam.NONE,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            iUnitTargetType: UnitTargetType.NONE,
            vVelocity: (direction * projectileSpeed) as Vector,
            bProvidesVision: true,
            iVisionRadius: radius,
            iVisionTeamNumber: caster.GetTeamNumber(),
        });
    }

    OnProjectileHit(_target: CDOTA_BaseNPC, location: Vector) {
        const caster = this.GetCaster();
        const duration = this.GetSpecialValueFor("duration");
        const radius = this.GetSpecialValueFor("radius");

        const enemies = FindUnitsInRadius(
            caster.GetTeamNumber(),
            location,
            undefined,
            radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC | UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            0,
            false,
        );

        for (const enemy of enemies) {
            ApplyDamage( {
                victim : enemy,
                attacker : this.GetCaster(),
                damage : 100,
                damage_type : DamageTypes.MAGICAL,
            } )
            // unit.AddNewModifier(caster, this, "modifier_meepo_earthbind", { duration });
        }

        ParticleManager.DestroyParticle(this.particle!, false);
        ParticleManager.ReleaseParticleIndex(this.particle!);

        return true;
    }
}
