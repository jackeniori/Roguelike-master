import { BaseAbility, registerAbility } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_3 extends BaseAbility {
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

        let dragon_slave_speed = 600
        let dragon_slave_width_initial = 0
        let dragon_slave_width_end = 200
        let dragon_slave_distance = 1000
		let vDirection = point - caster.GetAbsOrigin() as Vector
		vDirection.z = 0.0
		vDirection = vDirection.Normalized()
        dragon_slave_speed = dragon_slave_speed * ( dragon_slave_distance / ( dragon_slave_distance - dragon_slave_width_initial ) )
        let info = {
			// EffectName : 'particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf',
            EffectName : "particles/shuangtoulong2.vpcf",
            Ability : this,
            vSpawnOrigin : this.GetCaster().GetOrigin(), 
            fStartRadius : 200,//dragon_slave_width_initial,
            fEndRadius : 200,//dragon_slave_width_end,
            vVelocity : vDirection  * dragon_slave_speed as Vector,   //速度矢量
            fDistance : dragon_slave_distance,  //距离
            Source : this.GetCaster(),
            iUnitTargetTeam : UnitTargetTeam.ENEMY,
            iUnitTargetType : UnitTargetType.HERO + UnitTargetType.BASIC,
            iVisionRadius: 500
        }
        // ProjectileManager.CreateLinearProjectile( info )

        
        function RotateVector2D(v, angle, bIsDegree){
            if (bIsDegree){angle = math.rad(angle)}
                let xp = v.x * math.cos(angle) - v.y * math.sin(angle)
                let yp = v.x * math.sin(angle) + v.y * math.cos(angle)
            return Vector(xp, yp, v.z).Normalized()
        }
        let counter = 0 
        let whirl_duration = 10
		let axe_pfx = []
		let axe_loc = []
        let axe_random = []
        let axe_radius = 100
        let max_range = 200
        let direction = caster.GetForwardVector()
        let axe_movement_speed = 500
        const num:number = 0; 

        for(let i = 0;i<1;i++) {
            table.insert(axe_pfx, ParticleManager.CreateParticle("particles/units/heroes/hero_troll_warlord/troll_warlord_whirling_axe_melee.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, caster))
            ParticleManager.SetParticleControl(axe_pfx[i], 1, caster.GetAbsOrigin())
			ParticleManager.SetParticleControl(axe_pfx[i], 4, Vector(whirl_duration, 0, 0))
            table.insert(axe_random, math.random() * 0.9 + 1.8)
        }
        Timers.CreateTimer(FrameTime(),function(){
			counter = counter + FrameTime()
            for(let i=0;i<1;i++) {
                                                            //                     朝向      36角度    第几个
                axe_loc[i] = counter * (max_range - axe_radius) * RotateVector2D(direction, 36 * i + counter * axe_movement_speed, true).Normalized()
            }
            
            for(let i=0;i<1;i++) {
                ParticleManager.SetParticleControl(axe_pfx[i], 1, caster.GetAbsOrigin() + axe_loc[i] + Vector(0, 0, 40))
                // ParticleManager.SetParticleControl(axe_pfx[i], 1, caster.GetAbsOrigin())
            }
            print('kaishi')  
            print(counter * (max_range - axe_radius))
            print(RotateVector2D(direction, 36 * 0 + counter * axe_movement_speed, true).Normalized())
            print(axe_loc[0])
            print(caster.GetAbsOrigin())
			if (counter <= whirl_duration){
                return FrameTime()
            }	
			else{
                // for(let i=0;i<=10;i++) {
				// 	ParticleManager.DestroyParticle(axe_pfx[i], false)
				// 	ParticleManager.ReleaseParticleIndex(axe_pfx[i])
                // }
            }
            // let axe_loc = counter * (400 - 100) * RotateVector2D(direction, 36 * counter * 300, true).Normalized()
            // axe_pfx = ParticleManager.CreateParticle("particles/units/heroes/hero_troll_warlord/troll_warlord_whirling_axe_melee.vpcf", ParticleAttachment.ABSORIGIN_FOLLOW, caster)
            // ParticleManager.SetParticleControl(axe_pfx, 1, caster.GetAbsOrigin()+axe_loc+ Vector(0, 0, 40) as Vector)
            // ParticleManager.SetParticleControl(axe_pfx, 4, Vector(whirl_duration, 0, 0))
        }

        )

    }
	OnProjectileHit(hTarget, vLocation){
		if (hTarget!=null && ( ! hTarget.IsMagicImmune() ) && ( !hTarget.IsInvulnerable() )){
			ApplyDamage( {
				victim : hTarget,
				attacker : this.GetCaster(),
				damage : 100,
				damage_type : DamageTypes.MAGICAL,
				damage_flags: DamageFlag.NONE,
				ability : this
			} )
		}
    }
}
