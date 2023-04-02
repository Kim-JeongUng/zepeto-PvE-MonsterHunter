import { SandboxPlayer } from "ZEPETO.Multiplay";
import { IModule } from "../IModule";
import {GameEntity} from "ZEPETO.Multiplay.Schema";

export default class MonsterHunterModule extends IModule {

    async OnCreate() {
        /**Monster Sync**/
        this.server.onMessage(MESSAGE.SetEntity, (client, message) => {
            const { ObjectId, isMonster, MaxHp, Hp } = message;
            const entity = new GameEntity();
            entity.ObjectId = ObjectId;
            entity.isMonster = isMonster;
            entity.MaxHp = MaxHp;
            entity.Hp = Hp ?? MaxHp;
            console.log("set entity");
            this.server.state.GameEntities.set(ObjectId.toString(), entity);
        });

        this.server.onMessage(MESSAGE.TakeDamage, (client, message) => {
            const { ObjectId, quantity } = message;
            let entity = this.server.state.GameEntities.get(ObjectId.toString());
            if(entity) {
                console.log("TakeDamage");
                let currentHp = entity.Hp - quantity;
                if (currentHp <= 0) {
                    this.DeathEvent(client.sessionId, ObjectId);
                }
                entity.Hp =  currentHp;
            }
        });
        
        this.server.onMessage(MESSAGE.GainHp, (client, message) => {
            const { ObjectId, quantity } = message;
            let entity = this.server.state.GameEntities.get(ObjectId.toString());
            let currentHp = entity.Hp + quantity > entity.MaxHp ? entity.MaxHp : entity.Hp + quantity;
            Object.assign(entity.Hp, currentHp);
        });
    }

    async OnJoin(client: SandboxPlayer) {
    }

    async OnLeave(client: SandboxPlayer) {
    }

    OnTick(deltaTime: number) {
        
    }

    DeathEvent(attacker:string, victim:string){
        const deathEvent:DeathEvent={
            attacker,
            victim
        }
        this.server.broadcast("DeathEvent",deathEvent);
    }
    
}
interface DeathEvent{
    attacker:string,
    victim : string
}
enum MESSAGE {
    SetEntity = "SetEntity",
    TakeDamage = "TakeDamage",
    GainHp = "GainHp"
}
