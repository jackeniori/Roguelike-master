import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class aoe_test extends BaseAbility {
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
            /*
            Movement lock to control point 释放位置
            Movement basic  基本移动   Drag 这个好像是速度大小相关
            Position within box random  位置偏移
            */
            let nFXIndex = ParticleManager.CreateParticleForTeam( "particles/test/quanquan.vpcf", 
            ParticleAttachment.WORLDORIGIN, this.GetCaster(), this.GetCaster().GetTeamNumber() )
            ParticleManager.SetParticleControl( nFXIndex, 0, this.GetOrigin() )
            ParticleManager.SetParticleControl( nFXIndex, 1, Vector(0,0,0) )
            ParticleManager.SetParticleControl( nFXIndex, 2, Vector( 200, 1, 1 ) )
            // ParticleManager.ReleaseParticleIndex( nFXIndex )
            Timers.CreateTimer(3,function(){
					ParticleManager.DestroyParticle(nFXIndex, false)
					ParticleManager.ReleaseParticleIndex(nFXIndex)
            })
        }

    }

}

