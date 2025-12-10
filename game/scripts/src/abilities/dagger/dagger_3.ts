import { BaseAbility, registerAbility,BaseModifier, registerModifier  } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_3 extends BaseAbility {
    particle?: ParticleID;
    OnAbilityPhaseStart() {
        if (IsServer()) {
            this.GetCaster().EmitSound("Hero_Meepo.Earthbind.Cast");
        }
        return true;
    }

    OnSpellStart() {
        if(IsServer()) {
            let caster = this.GetCaster();
            let point = caster.GetCursorPosition()
            let direction = ((point - caster.GetOrigin()) as Vector).Normalized();
            //direction.z = 0;
            //caster.SetForwardVector(direction)
            let AnglesY = caster.GetAnglesAsVector().y
            this.particle = ParticleManager.CreateParticle(
                'particles/hero_mars/mars_shield_bash_full_circle.vpcf',
                ParticleAttachment.WORLDORIGIN,
                caster,
            );
            ParticleManager.SetParticleControl(this.particle, 0, caster.GetOrigin());
            ParticleManager.SetParticleControlForward(this.particle, 0, direction);
            ParticleManager.ReleaseParticleIndex(this.particle)
            const enemies = FindUnitsInRadius(
                caster.GetTeamNumber(),
                caster.GetAbsOrigin()+ direction * 120 as Vector,
                null,
                150,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC | UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                0,
                false,
            );
            if(enemies.length != 0){
                for (const enemy of enemies) {
                    ApplyDamage( {
                        victim : enemy,
                        attacker : this.GetCaster(),
                        damage : 100,
                        damage_type : DamageTypes.MAGICAL,
                    } )
                }
                caster.AddNewModifier(caster, this, "modifier_dagger_3_retreat", {PX:point.x,PY:point.y,PZ:point.z})
            }

        }
    }
}
@registerModifier()
export class modifier_dagger_3_retreat extends BaseModifier {
    Point: any;
    dash_speed: number;
    caster: CDOTA_BaseNPC;
    Origin: any;
    Angles: any;
    casterorigin: any;
    target_point: Vector;
    direction: Vector;
    ceship: number;
    move: Vector;

    OnCreated(kv){
        this.Point = kv
        this.dash_speed = 4000
        this.caster =this.GetCaster()
        this.Origin =this.caster.GetAbsOrigin()
        if(IsServer()) {
            this.Angles = kv.Angles
            this.casterorigin = this.caster.GetAbsOrigin()
            this.target_point = Vector(kv.PX,kv.PY,kv.PZ)
            let P = this.casterorigin - this.target_point as Vector
            this.direction = P.Normalized()
            this.ceship = 300;

            let dash = ParticleManager.CreateParticle("particles/units/heroes/hero_pangolier/pangolier_swashbuckler_dash.vpcf", ParticleAttachment.WORLDORIGIN, this.GetCaster())
            ParticleManager.SetParticleControl(dash, 0, this.GetCaster().GetAbsOrigin()) 
            this.AddParticle(dash, false, false, -1, true, false)
            this.StartIntervalThink( FrameTime())
        }
        
    }
    OnIntervalThink(){
        if(IsServer()) {
            let casterorigin = this.caster.GetAbsOrigin()
            let ceship = (this.Origin + this.direction * 300 as Vector)
            if(this.ceship == 300 || this.ceship > (casterorigin - ceship as Vector).Length2D()){
                this.ceship = (casterorigin - ceship as Vector).Length2D()
                this.move = (this.GetCaster().GetAbsOrigin() + this.direction * this.dash_speed *  FrameTime()) as Vector
            }else{
                this.move = ceship
                this.HorizontalMotion(this.move,true,casterorigin)
                this.Destroy()
                return
            }
            this.HorizontalMotion(this.move,false)
        }
    }
    HorizontalMotion(new_location:Vector,boolean:boolean,casterorigin?){
        if(IsServer()) {
            this.GetCaster().SetAbsOrigin(new_location)
            if(boolean){
                this.caster.SetContextThink('',function(){
                    this.FaceTowards(casterorigin)
                    return null
                },0.03)
            }
        }
    }
}
