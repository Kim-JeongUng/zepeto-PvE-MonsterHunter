import { SandboxPlayer } from "ZEPETO.Multiplay";
import { IModule } from "../IModule";
import {GameEntity} from "ZEPETO.Multiplay.Schema";
import { loadDataStorage} from 'ZEPETO.Multiplay.DataStorage'

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
            const { attacker, victim, quantity } = message;
            let entity = this.server.state.GameEntities.get(victim.toString());
            if(entity) {
                let currentHp = entity.Hp - quantity;
                currentHp = currentHp < 0 ? 0 :currentHp;
                if (currentHp == 0) {
                    this.DeathEvent(attacker, victim);
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

        
        //Load Player DataStorage (no data : default value)
        this.server.onMessage(MESSAGE.GetAllPlayerData, async (client) => {
            let isNewMember : boolean = false;
            const defaultValues: [string, number][] = [
                ['MaxHp', 200],
                ['AD', 10],
                ['Level', 1],
                ['Exp', 0],
            ];

            const storage = await loadDataStorage(client.userId);
            if (storage !== null) {
                let values = await storage.mget(defaultValues.map(([key]) => key));
                for (const [key, defaultValue] of defaultValues) {
                    const value = values[key];
                    if (value === undefined || value === null) {
                        await storage.set(key, defaultValue);
                        isNewMember = true;
                    }
                }
                if(isNewMember){
                    values = await storage.mget(defaultValues.map(([key]) => key));
                }
                client.send('onGetAllPlayerDataResult', values );
            }
        });
    }

    async OnJoin(client: SandboxPlayer) {
    }

    async OnLeave(client: SandboxPlayer) {
    }

    OnTick(deltaTime: number) {
        
    }

    DeathEvent(attacker:string, victim:string){
        this.server.broadcast("DeathEvent"+victim,attacker);
        this.server.broadcast("KillEvent"+attacker,victim);
    }

}


enum MESSAGE {
    SetEntity = "SetEntity",
    TakeDamage = "TakeDamage",
    GainHp = "GainHp",
    GetAllPlayerData = "GetAllPlayerData"
}
