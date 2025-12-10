import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_9 extends BaseAbility {
    Precache(context){
        PrecacheResource( "particle", "particles/units/heroes/hero_windrunner/windrunner_spell_powershot.vpcf", context )
    }
    OnSpellStart() {
        const caster = this.GetCaster();
        const point = this.GetCursorPosition();
        let direction = ((caster.GetAbsOrigin() - point) as Vector).Normalized();
        direction.z = 0;
        caster.SetForwardVector(direction)
        caster.AddNewModifier(caster, this, "modifier_dagger_9", {duration:4,direction:direction})
        ProjectileManager.CreateLinearProjectile({
            Ability: this,
            EffectName: "particles/units/heroes/hero_windrunner/windrunner_spell_powershot.vpcf",
            vSpawnOrigin: caster.GetAbsOrigin(),
            fDistance: 200,
            fStartRadius: 200,
            fEndRadius: 200,
            Source: caster,
            bHasFrontalCone: false,
            iUnitTargetTeam: UnitTargetTeam.NONE,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            iUnitTargetType: UnitTargetType.NONE,
            vVelocity: (direction * 300) as Vector,
            fExpireTime: GameRules.GetGameTime()  + 10,
            bProvidesVision: true,
            iVisionRadius: 1200,
            iVisionTeamNumber: caster.GetTeamNumber(),
        });
    }
}

@registerModifier()
class modifier_dagger_9 extends BaseModifier {
    particle: ParticleID;
    caster: CDOTA_BaseNPC;
    OnCreated(kv: { direction: Vector; }){
        if(IsServer()) {
            let direction: Vector = Vector(kv.direction.x,kv.direction.y,kv.direction.z)
            this.caster = this.GetCaster()
            this.GetCaster().AddActivityModifier("powershot") 
            //this.GetCaster().StartGestureWithFadeAndPlaybackRate(GameActivity.DOTA_CAST_ABILITY_5, 0, 1.3,1)
            this.GetCaster().StartGesture(GameActivity.DOTA_CHANNEL_ABILITY_5)
    //         this.particle = ParticleManager.CreateParticle(
    //             "models/items/faceless_void/faceless_void_arcana/debut/particles/drow_frost_arrow_model.vpcf",
    //             ParticleAttachment.WATERWAKE,
    //             this.caster,
    //         );
    
    //         ParticleManager.SetParticleControl(this.particle, 0, this.caster.GetAbsOrigin());
            // ProjectileManager.CreateLinearProjectile({
            //     Ability: this.GetAbility(),
            //     EffectName: "particles/units/heroes/hero_mirana/mirana_spell_arrow.vpcf",
            //     vSpawnOrigin: this.caster.GetAbsOrigin(),
            //     fDistance: 200,
            //     fStartRadius: 200,
            //     fEndRadius: 200,
            //     Source: this.caster,
            //     bHasFrontalCone: false,
            //     iUnitTargetTeam: UnitTargetTeam.NONE,
            //     iUnitTargetFlags: UnitTargetFlags.NONE,
            //     iUnitTargetType: UnitTargetType.NONE,
            //     vVelocity: (direction * 1500) as Vector,
            //     fExpireTime: GameRules.GetGameTime()  + 10,
            //     bProvidesVision: true,
            //     iVisionRadius: 200,
            //     iVisionTeamNumber: this.caster.GetTeamNumber(),
            // });

            
        }
    }

    OnDestroy(){
        if(IsServer()) {
            this.GetCaster().FadeGesture(GameActivity.DOTA_CHANNEL_ABILITY_5)
            this.GetCaster().ClearActivityModifiers()
        }
    }
}


