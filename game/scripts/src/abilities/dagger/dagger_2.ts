import { BaseAbility, registerAbility,BaseModifier, registerModifier  } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_2 extends BaseAbility {
    particle?: ParticleID;
    OnSpellStart(){
        if (this.GetCursorPosition() == this.GetCaster().GetAbsOrigin()){
            this.GetCaster().SetCursorPosition(this.GetCursorPosition() + this.GetCaster().GetForwardVector()as Vector)
        }
	let caster = this.GetCaster()
	let ability = this
	let point = caster.GetCursorPosition()
	let direction = (point - caster.GetAbsOrigin()as Vector).Normalized()
    caster.SetForwardVector(direction)
    let Anglesy = caster.GetAnglesAsVector().y
    if(caster.GetAnglesAsVector().y + 180 > 360){
        Anglesy = Anglesy - 180
    }else{
        Anglesy = Anglesy + 180
    }
    caster.AddNewModifier(caster, ability, "modifier_dagger_2", {PX:point.x,PY:point.y,PZ:point.z,Angles:Anglesy})

            
    ProjectileManager.CreateLinearProjectile({
        Ability: this,
        EffectName: "particles/test/banyuezhan.vpcf",
        vSpawnOrigin: caster.GetAbsOrigin(),
        fDistance: 1000,
        fStartRadius: 1000,
        fEndRadius: 1000,
        Source: caster,
        bHasFrontalCone: false,
        iUnitTargetTeam: UnitTargetTeam.NONE,
        iUnitTargetFlags: UnitTargetFlags.NONE,
        iUnitTargetType: UnitTargetType.NONE,
        vVelocity: (direction * 300) as Vector,
        fExpireTime: 10,
        bProvidesVision: true,
        iVisionRadius: 1200,
        iVisionTeamNumber: caster.GetTeamNumber(),
    });
    }
    
}

@registerModifier()
export class modifier_dagger_2 extends BaseModifier {
    Point: any;
    dash_speed: number;
    caster: CDOTA_BaseNPC;
    Origin: Vector;
    Angles: any;
    casterorigin: any;
    target_point: Vector;
    direction: Vector;
    ceship: number;
    move: Vector;
    particle?: ParticleID;
    OnCreated(kv){
        this.Point = kv
        this.dash_speed = 4000
        this.caster =this.GetCaster()
        this.Origin =this.caster.GetAbsOrigin()
        if(IsServer()) {
            this.Angles = kv.Angles
            this.casterorigin = this.caster.GetAbsOrigin()
            this.target_point = Vector(kv.PX,kv.PY,kv.PZ)
            let P = Vector(kv.PX-this.casterorigin.x,kv.PY-this.casterorigin.y,kv.PZ-this.casterorigin.z)
            this.direction = P.Normalized()
            this.ceship = 500;
            this.caster.StartGesture(GameActivity.DOTA_RUN)
            Timers.CreateTimer( FrameTime(),()=>{
                let dash = ParticleManager.CreateParticle("particles/units/heroes/hero_pangolier/pangolier_swashbuckler_dash.vpcf", ParticleAttachment.WORLDORIGIN, this.GetCaster())
                ParticleManager.SetParticleControl(dash, 0, this.GetCaster().GetAbsOrigin()) 
                this.AddParticle(dash, false, false, -1, true, false)
                this.StartIntervalThink( FrameTime())
            })

        }
        
    }
    OnIntervalThink(){
        if(IsServer()) {
            let casterorigin = this.caster.GetAbsOrigin()
            let ceship = (this.Origin + this.direction * 500 as Vector)
            if(this.ceship == 500 || this.ceship > (casterorigin - ceship as Vector).Length2D()){
                this.ceship = (casterorigin - ceship as Vector).Length2D()
                this.move = (this.GetCaster().GetAbsOrigin() + this.direction * this.dash_speed *  FrameTime()) as Vector
            }else{
                this.move = ceship
                this.HorizontalMotion(this.move,true)
                this.Destroy()
                return
            }
            this.caster.AddNewModifier(this.caster,this.caster.FindAbilityByName('dagger_2'),'modifier_invisible',{duration:5})
            this.HorizontalMotion(this.move,false)
        }
    }
    OnDestroy(){
        if(IsServer()) {
            this.caster.FadeGesture(GameActivity.DOTA_RUN)
            Timers.CreateTimer(0.1,()=>{
                this.caster.RemoveModifierByName('modifier_invisible')
                this.caster.AddNewModifier(this.caster,this.caster.FindAbilityByName('dagger_2'),"modifier_dagger_2_act",{duration:0.5})
                this.caster.AddNewModifier(this.caster,this.caster.FindAbilityByName('dagger_2'),"modifier_dagger_3", {PX:this.Point.PX,PY:this.Point.PY,PZ:this.Point.PZ,Angles:this.Angles})
            })
            
        }
    }
    HorizontalMotion(new_location,boolean){
        if(IsServer()) {
            this.GetCaster().SetAbsOrigin(new_location)
            if(boolean){
                let C = this.caster
                let co =this.casterorigin
                C.SetContextThink('',function(){
                    C.FaceTowards(co)
                    return null
                },0.03)
            }
        }
    }
}

@registerModifier()
class modifier_dagger_2_act extends BaseModifier {
    OnCreated(kv){
        if(IsServer()) {
            this.GetCaster().AddActivityModifier("chen_penitence") 
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
@registerModifier()
export class modifier_dagger_3 extends BaseModifier {
    particle: ParticleID;
    OnCreated(kv) {
        if(IsServer()) {
            const caster = this.GetCaster();
            const point = Vector(kv.PX,kv.PY,kv.PZ)
            const direction = ((point - caster.GetAbsOrigin()) as Vector).Normalized();
            direction.z = 0;
            this.particle = ParticleManager.CreateParticle(
                'particles/test/banyuezhan.vpcf',
                ParticleAttachment.CUSTOMORIGIN,
                caster,
            );
            ParticleManager.SetParticleControl(this.particle, 0, caster.GetAbsOrigin());
            ParticleManager.SetParticleControl(this.particle, 1, Vector(kv.Angles-45,0,0));
            this.Destroy()
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
            for (const enemy of enemies) {
                ApplyDamage( {
                    victim : enemy,
                    attacker : this.GetCaster(),
                    damage : 100,
                    damage_type : DamageTypes.MAGICAL,
                } )
            }   
        }
    }
}

@registerModifier()
export class modifier_invisible extends BaseModifier {
    CheckState() {
        return {
            [ModifierState.INVISIBLE]:true,
            //[ModifierState.NO_UNIT_COLLISION]:true,
        }
    }
    DeclareFunctions(){
        return [];
    }
}

