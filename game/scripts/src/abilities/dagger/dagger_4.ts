import { BaseAbility, registerAbility,BaseModifier, registerModifier } from "../../utils/dota_ts_adapter"; 

@registerAbility()  
export class dagger_4 extends BaseAbility {
    particle?: ParticleID;
    OnSpellStart() {
        // const caster = this.GetCaster();
        // const point = caster.GetCursorPosition();
        // const direction = ((point - caster.GetAbsOrigin()) as Vector).Normalized();
        // direction.z = 0;
        // caster.SetForwardVector(direction)
        // caster.AddNewModifier(caster, this, "modifier_dagger_4", {origin:caster.GetAbsOrigin(),PX:point.x,PY:point.y,PZ:point.z,duration:3})
    }
    OnAbilityPhaseStart(){
        const caster = this.GetCaster();
        const point = caster.GetCursorPosition();
        const direction = ((point - caster.GetAbsOrigin()) as Vector).Normalized();
        direction.z = 0;
        caster.SetForwardVector(direction)
        caster.AddNewModifier(caster, this, "modifier_dagger_4", {origin:caster.GetAbsOrigin(),PX:point.x,PY:point.y,PZ:point.z,duration:3})
        return true
    }
    OnAbilityPhaseInterrupted(){
        this.GetCaster().RemoveModifierByName("modifier_dagger_4")
    }
}

@registerModifier()
export class modifier_dagger_4 extends BaseModifier {
    dash: ParticleID;
    target_point: Vector;
    dir: number;
    procs: number;
    parent: CDOTA_BaseNPC;
    origin: Vector;
    ability: CDOTABaseAbility;
    charge_finish: boolean;
    current_angle: any;
    face_target: boolean;
    target_angle: number;
    filter: any;
    effect_cast: ParticleID;
    pos: Vector;
    time: number;

    OnCreated(kv){
        this.time = 2
        this.parent = this.GetParent()
        this.ability = this.GetAbility()
        this.pos = Vector(kv.PX,kv.PY,kv.PZ)
        if(IsServer()){
            this.origin = this.parent.GetOrigin()
            this.charge_finish = false
            this.target_angle = this.parent.GetAnglesAsVector().y
            this.current_angle = this.target_angle
            this.face_target = true
            this.StartIntervalThink( FrameTime() )
            this.PlayEffects1()
        }
    }
    PlayEffects1() {
        let particle_cast = "particles/units/heroes/hero_primal_beast/primal_beast_onslaught_range_finder.vpcf"
        this.dash = ParticleManager.CreateParticleForPlayer( particle_cast, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent, this.parent.GetPlayerOwner() )
        ParticleManager.SetParticleControl( this.dash, 0, this.parent.GetOrigin() )
        this.effect_cast = this.dash
        this.SetEffects()
    }

    SetEffects(){
        if(this.time<=0){
            return
        }
        this.time = this.time-0.1
        let target_pos:Vector = this.origin + this.parent.GetForwardVector() * 600 * (2-this.time) as Vector
        ParticleManager.SetParticleControl( this.effect_cast, 1, target_pos  )  //this.pos
    }
    OnIntervalThink(){
        this.SetEffects()
    }

    OnDestroy(){
        if(IsServer()){
           ParticleManager.DestroyParticle(this.dash,true)
        }
    }

}
