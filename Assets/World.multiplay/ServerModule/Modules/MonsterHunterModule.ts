import { SandboxPlayer } from "ZEPETO.Multiplay";
import { IModule } from "../IModule";
import {GameEntity} from "ZEPETO.Multiplay.Schema";

export default class MonsterHunterModule extends IModule {

    async OnCreate() {
        /**Transform Sync**/
        this.server.onMessage(MESSAGE.SetEntity, (client, message) => {
            const { ObjectId, MaxHp, Hp, AttackDamage } = message;
            let entity = this.server.state.GameEntities.get(ObjectId.toString());

            if (!entity) {
                entity = new GameEntity();
                this.server.state.GameEntities.set(ObjectId.toString(), entity);
            }
            Object.assign(entity.MaxHp, MaxHp);
            Object.assign(entity.Hp, Hp);
            Object.assign(entity.AttackDamage, AttackDamage);
        });
        
        this.server.onMessage(MESSAGE.TakeDamage, (client, message) => {
            const { ObjectId, quantity } = message;
            let entity = this.server.state.GameEntities.get(ObjectId.toString());
            let currentHp = entity.Hp - quantity >= 0 ? entity.Hp - quantity : 0;
            Object.assign(entity.Hp, currentHp);
        });
    }

    async OnJoin(client: SandboxPlayer) {
    }

    async OnLeave(client: SandboxPlayer) {
    }

    OnTick(deltaTime: number) {
    }

}

enum MESSAGE {
    SetEntity = "SetEntity",
    TakeDamage = "TakeDamage"
}
