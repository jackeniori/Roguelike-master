import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class normal_test extends BaseAbility {
    particle?: ParticleID;

    OnAbilityPhaseStart() {
        if (IsServer()) {
            // this.GetCaster().EmitSound("Hero_Meepo.Earthbind.Cast");
        }
        return true;
    }

    OnSpellStart() {
        const caster = this.GetCaster();
        const point = this.GetCursorPosition();
        const direction = ((caster.GetAbsOrigin()- point ) as Vector).Normalized();
        caster.AddNewModifier(caster,caster.FindAbilityByName('normal_test'),"modifier_normal_test", {duration:1})
        //caster.SetForwardVector(direction)
        let nFXIndex = ParticleManager.CreateParticleForTeam( "particles/test/test1.vpcf",     //"",   
            ParticleAttachment.WORLDORIGIN, this.GetCaster(), this.GetCaster().GetTeamNumber() )
            Timers.CreateTimer(0.03,function(){
            ParticleManager.SetParticleControl(nFXIndex, 0, caster.GetAbsOrigin());
            ParticleManager.SetParticleControl(nFXIndex, 1, caster.GetAnglesAsVector());
            ParticleManager.SetParticleControl(nFXIndex, 2, caster.GetAnglesAsVector());
            print(caster.GetAnglesAsVector())
        })
            Timers.CreateTimer(1,function(){
					ParticleManager.DestroyParticle(nFXIndex, false)
					ParticleManager.ReleaseParticleIndex(nFXIndex) 
            })
    }
}

@registerModifier()
class modifier_normal_test extends BaseModifier {
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
