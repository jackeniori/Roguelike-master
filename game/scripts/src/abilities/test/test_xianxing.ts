import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 
//aoe范围显示
@registerAbility()  
export class test_xianxing extends BaseAbility {
    particle?: ParticleID;

    GetCooldown() {
        let cooldown = 0.2;
        if (IsServer()) {

        }
        return cooldown;
    }
    //技能刚释放
    OnAbilityPhaseStart() {
        if (IsServer()) {

        }
        return true;
    }
    //技能结束 
    OnAbilityPhaseInterrupted() {

    }

    OnSpellStart() {
        if (IsServer()) {
            const caster = this.GetCaster();
            const point = this.GetCursorPosition();
            
            let dragon_slave_speed = 600
            let dragon_slave_width_initial = 0
            let dragon_slave_width_end = 200
            let dragon_slave_distance = 1000
            const direction = ((point - caster.GetAbsOrigin()) as Vector).Normalized();
            caster.SetForwardVector(direction)
            let vDirection = point - caster.GetAbsOrigin() as Vector
            vDirection.z = 0.0
            vDirection = vDirection.Normalized()
            dragon_slave_speed = dragon_slave_speed * ( dragon_slave_distance / ( dragon_slave_distance - dragon_slave_width_initial ) )
            let info = {
                EffectName : "particles/test/shexianquanquan.vpcf",
                Ability : this,
                vSpawnOrigin : this.GetCaster().GetOrigin(), 
                fStartRadius : dragon_slave_width_initial,
                fEndRadius : dragon_slave_width_end,
                vVelocity : vDirection  * dragon_slave_speed as Vector,   //速度矢量
                fDistance : dragon_slave_distance,  //距离
                Source : this.GetCaster(),
                iUnitTargetTeam : UnitTargetTeam.ENEMY,
                iUnitTargetType : UnitTargetType.HERO + UnitTargetType.BASIC,
                iVisionRadius: 500
            }
            ProjectileManager.CreateLinearProjectile( info )
        }

    }

    OnProjectileHit(hTarget: CDOTA_BaseNPC, vLocation: Vector) {
        if(hTarget != null){
            ApplyDamage( {
                victim : hTarget,
                attacker : this.GetCaster(),
                damage : 100,
                damage_type : DamageTypes.MAGICAL,
                ability :this
            } )
        }

        return true;
    }
}

