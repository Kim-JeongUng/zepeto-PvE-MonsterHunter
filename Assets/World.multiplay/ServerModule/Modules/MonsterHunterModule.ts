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
            const { attacker, victim, quantity } = message;
            let entity = this.server.state.GameEntities.get(victim.toString());
            if(entity) {
                console.log("TakeDamage");
                let currentHp = entity.Hp - quantity;
                currentHp = currentHp < 0 ? 0 :entity.Hp;
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

        // DataStorage
        this.server.onMessage("SetDataStorage", (client, storageMessage:Map<string, number> ) => {

            console.log(`[onSetStorage]`);
            this.SetStorage(client, storageMessage);
        });

        this.server.onMessage('MGetDataStorage', async (client: SandboxPlayer, keys: string[]) => {
            console.log(`[onGetStorage] ${keys.length}`);

            this.GetStorage(client, keys);
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

    async SetStorage(client: SandboxPlayer,storageMessage:Map<string, number> ) {

        try {
            console.log("SET!!!");
            const storage = client.loadDataStorage();
            // storageMessage.forEach()
            // const keyValues = Array.from(storageMessage.entries()).map(([key, value]) => ({
            //     key,
            //     value
            // }));
            const success = await storage.mset<number>(storageMessage);
            if(success){
                this.GetStorage(client,storageMessage.keys());
            }
            
        }
        catch (e)
        {
            console.log(`${e}`);
        }
    }


    async GetStorage(client: SandboxPlayer, keys: string[]) {

        try {
            const storage = client.loadDataStorage();
            const keyValeus = await storage.mget(keys);
            console.log("get");
            if(keyValeus)
                client.send("StorageResult", keyValeus);
            else{
                console.log('exception');
            }
        }
        catch (e)
        {
            console.log(`${e}`);
        }
    }
    

}

// interface DeathEvent{
//     attacker:string,
//     victim : string
// }

enum MESSAGE {
    SetEntity = "SetEntity",
    TakeDamage = "TakeDamage",
    GainHp = "GainHp"
}
