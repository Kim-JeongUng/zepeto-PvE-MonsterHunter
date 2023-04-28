import { SandboxPlayer } from "ZEPETO.Multiplay";
import { IModule } from "../IModule";
import {GameEntity} from "ZEPETO.Multiplay.Schema";
import { loadDataStorage} from 'ZEPETO.Multiplay.DataStorage'

const MaxExp = 30;

export default class MonsterHunterModule extends IModule {
    private monsterData: Record<string, IMonsterData> = {
        "Golem": {
            Name: "Golem",
            MaxHp: 100,
            Power: 10,
            RewardCurrency: 10,
            RewardExp: 10,
        },
        "Slime": {
            Name: "Slime",
            MaxHp: 500,
            Power: 20,
            RewardCurrency: 20,
            RewardExp: 20,
        },
        // ...
    };
    private serverObjId = 10000;

    async OnCreate() {
        /**Monster Sync**/
        this.CreateBaseMonster();

        //TODO : 서버에서 Set해서 클라로 주는걸로 변경
        this.server.onMessage(MESSAGE.SetEntity, (client, message) => {
            const { ObjectId, isMonster, MaxHp, Hp } = message;

            let entity = this.server.state.GameEntities.get(ObjectId);
            if(entity === null || entity === undefined){
                entity = new GameEntity();
                entity.ObjectId = ObjectId;
                entity.isMonster = isMonster;
                entity.MaxHp = MaxHp;
                entity.Hp = Hp ?? MaxHp;
                console.log("set entity");
                this.server.state.GameEntities.set(ObjectId.toString(), entity);
            }
        });

        this.server.onMessage(MESSAGE.TakeDamage, (client, message) => {
            const { attacker, victim, quantity } = message;
            let entity = this.server.state.GameEntities.get(victim.toString());
            if(entity && entity.Hp != 0) {
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

        this.server.onMessage(MESSAGE.GainExp, async (client, quantity: number) => {

            const storage = await loadDataStorage(client.userId);

            if (storage !== null) {
                let expValues = await storage.get("Exp") as number;
                let tempExp = expValues + quantity;
                let isLevelChanged = false;
                let levelChangeValue = 0;

                while(tempExp >= MaxExp){
                    tempExp -= MaxExp;
                    levelChangeValue++;
                    isLevelChanged = true;
                }
                await storage.set("Exp", tempExp);
                if(isLevelChanged){
                    let levelValues = await storage.get("Level") as number;
                    await storage.set("Level", levelValues + levelChangeValue);
                }
                await this.GetAllPlayerData(client);
            }
        });

        //Load Player DataStorage (no data : default value)
        this.server.onMessage(MESSAGE.GetAllPlayerData, async (client) => {
            await this.GetAllPlayerData(client);
        });
    }

    async OnJoin(client: SandboxPlayer) {
    }

    async OnLeave(client: SandboxPlayer) {
    }

    OnTick(deltaTime: number) {

    }
    CreateBaseMonster(){
        const monster = this.monsterData['Golem'];

        this.server.broadcast(MESSAGE.SpawnMonster, monster);
        entity = new GameEntity();
        entity.ObjectId = this.serverObjId++;
        entity.Name = monster.Name;
        entity.isMonster = true;
        entity.MaxHp = monster.MaxHp;
        entity.Hp = monster.MaxHp;

        this.server.state.GameEntities.set(ObjectId.toString(), entity);
    }

    DeathEvent(attacker:string, victim:string){
        const entity = this.server.state.GameEntities.get(victim);
        if(entity !== null){
            const monster = this.monsterData[entity.name];

            const monsterReward: MonsterReward = {
                Currency : monster.RewardCurrency,
                Exp : monster.RewardExp
            }
            this.server.broadcast("OnReward"+attacker,monsterReward);
        }
    }

    async GetAllPlayerData(client : SandboxPlayer){
        let isNewMember : boolean = false;
        const defaultValues: [string, number][] = [
            ['MaxHp', 200],
            ['AD', 20],
            ['Level', 1],
            ['Exp', 0],
        ];

        const storage = await loadDataStorage(client.userId);
        if (storage !== null) {
            let values = await storage.mget(defaultValues.map(([key]) => key)) as IPlayerData;

            for (const [key, defaultValue] of defaultValues) {
                const value = values[key];
                if (value === undefined || value === null) {
                    await storage.set(key, defaultValue);
                    isNewMember = true;
                }
            }
            if(isNewMember){
                values = await storage.mget(defaultValues.map(([key]) => key)) as IPlayerData;
            }
            client.send('onGetAllPlayerDataResult', values );
        }
    }

}

interface IPlayerData {
    MaxHp: number;
    AD: number;
    Level: number;
    Exp: number;
    [key: string]: number;
}

interface IMonsterData {
    Name : string;
    MaxHp : number;
    Power : number;
    //reward
    RewardCurrency: number;
    RewardExp: number;
}

enum MESSAGE {
    SetEntity = "SetEntity",
    TakeDamage = "TakeDamage",
    GainHp = "GainHp",
    GainExp = "GainExp",
    GetAllPlayerData = "GetAllPlayerData",
    SpawnMonster = "SpawnMonster"
}
