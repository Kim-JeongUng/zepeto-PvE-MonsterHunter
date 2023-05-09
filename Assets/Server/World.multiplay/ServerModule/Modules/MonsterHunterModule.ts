import { SandboxPlayer } from "ZEPETO.Multiplay";
import { IModule } from "../IModule";
import {Monster} from "ZEPETO.Multiplay.Schema";
import { loadDataStorage} from 'ZEPETO.Multiplay.DataStorage'

const MaxExp = 30;
const MaxMonster = 10;
const defaultPlayerData: [string, number][] = [
    ['MaxHp', 200],
    ['AD', 20],
    ['Level', 1],
    ['Exp', 0],
];
const monsterData = new Map<string, IMonsterData>([
    [
        "Golem",
        {
            Name: "Golem",
            MaxHp: 100,
            Power: 10,
            RewardCurrency: 10,
            RewardExp: 10,
        }
    ],
    [
        "Slime",
        {
            Name: "Slime",
            MaxHp: 500,
            Power: 20,
            RewardCurrency: 20,
            RewardExp: 20,
        }
    ]
    // ...
]);

export default class MonsterHunterModule extends IModule {
    private playerData: Map<string, IPlayerData> = new Map<string, IPlayerData>();
    private serverObjId = 10000;

    async OnCreate() {
        //3초 간격으로 몬스터 개수 파악 후 생성
        setInterval(() => {
            if(MaxMonster > this.server.state.Monsters.size)
                this.CreateBaseMonster(); 
        }, 3000); 

        this.server.onMessage(MESSAGE.TakeDamageToMonster, (client, monsterObjId:string) => {
            const quantity = this.playerData.get(client.sessionId).AD;
            let monster:Monster = this.server.state.Monsters.get(monsterObjId.toString());
            console.log(monsterObjId+"Attack!" + monster.Hp+" "+quantity);
            if(monster && monster.Hp != 0) {
                let currentHp = monster.Hp - quantity;
                currentHp = currentHp < 0 ? 0 :currentHp;
                monster.Hp =  currentHp;
                if (currentHp == 0) {
                    //monster die
                    console.log(`${monster.Name} is die`);
                    this.OnMonsterDie(client, monster);
                }
            }
        });

        this.server.onMessage(MESSAGE.TakeDamageToPlayer, (client, monsterObjId:string) => {
            let monster = this.server.state.Monsters.get(victim.toString());
            const quantity = monsterData.get(monsterObjId.Name).AD;
            
            let player = this.server.state.players.get(client.sessionId);
            if(player && player.Hp != 0) {
                let currentHp = player.Hp - quantity;
                currentHp = currentHp < 0 ? 0 :currentHp;
                if (currentHp == 0) {
                    //player die
                    console.log(`${client.sessionId} is die`);
                }
                player.Hp =  currentHp;
            }
        });

        this.server.onMessage(MESSAGE.GainHp, (client, message) => {
            const { ObjectId, quantity } = message;
            let entity = this.server.state.Monsters.get(ObjectId.toString());
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
                await this.LoadPlayerData(client);
            }
        });

        //Load Player DataStorage (no data : default value)
        this.server.onMessage(MESSAGE.LoadPlayerData, async (client) => {
            await this.LoadPlayerData(client);
        });
    }

    async OnJoin(client: SandboxPlayer) {
        //load data
        await this.LoadPlayerData(client);
    }

    async OnLeave(client: SandboxPlayer) {
        //save data
        await this.SavePlayerData(client);
        this.playerData.delete(client.sessionId);
    }

    OnTick(deltaTime: number) {

    }
    
    CreateBaseMonster(){
        const monster = monsterData.get('Golem');

        console.log("Spawn!"+monster.Name);
        if(monster === undefined){
            console.log("undefine");
            return;
        }
        const ObjectId = (this.serverObjId++).toString();
        let entity = new Monster();
        entity.ObjectId = ObjectId;
        entity.SpawnPoint = Math.floor(Math.random() * 11);
        entity.Name = monster.Name;
        entity.Hp = monster.MaxHp;
        this.server.state.Monsters.set(ObjectId, entity);
    }

    OnMonsterDie(client:SandboxPlayer, monster:Monster){
        if(monster !== null){
            const monsterReward = monsterData.get(monster.Name);
            client.send("OnReward",1);
            //TODO : Reward 서버에서 처리
            console.log("OnReward"+monsterReward.Name);
            
            //3초 후 서버에서 엔티티 제거
            setTimeout(()=> {
                this.server.state.Monsters.delete(monster.ObjectId);
            }, 3000);
        }
    }

    async LoadPlayerData(client : SandboxPlayer){
        let isNewMember : boolean = false;
        
        const storage = await loadDataStorage(client.userId);
        if (storage !== null) {
            let values = await storage.mget(defaultPlayerData.map(([key]) => key)) as IPlayerData;

            for (const [key, defaultValue] of defaultPlayerData) {
                const value = values[key];
                if (value === undefined || value === null) {
                    await storage.set(key, defaultValue);
                    isNewMember = true;
                }
            }
            if(isNewMember){
                values = await storage.mget(defaultPlayerData.map(([key]) => key)) as IPlayerData;
            }
            
            this.playerData.set(client.sessionId, values);
            client.send('onGetAllPlayerDataResult', values );
        }
    }
    
    async SavePlayerData(client : SandboxPlayer) {
        const storage = await loadDataStorage(client.userId);
        for (const [key, data] of this.playerData[client.sessionId]) {
            const value = values[key];
            if (value === undefined || value === null) {
                await storage.set(key, data);
            }
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
    AD : number;
    //reward
    RewardCurrency: number;
    RewardExp: number;
}

enum MESSAGE {
    SetEntity = "SetEntity",
    TakeDamageToMonster = "TakeDamageToMonster",
    TakeDamageToPlayer = "TakeDamageToPlayer",
    GainHp = "GainHp",
    GainExp = "GainExp",
    LoadPlayerData = "LoadPlayerData",
    SpawnMonster = "SpawnMonster"
}
