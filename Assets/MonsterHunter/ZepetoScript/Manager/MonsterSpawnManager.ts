import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Monster, State} from "ZEPETO.Multiplay.Schema";
import {GameObject, Object, Resources} from "UnityEngine";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";

export default class MonsterSpawnManager extends ZepetoScriptBehaviour {
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private _currentMonsters: Map<string, Monster> = new Map<string, Monster>();
    
    Start() {
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this._room.OnStateChange += this.OnStateChange;
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {
        const join = new Map<string, Monster>();
        const leave = new Map<string, Monster>(this._currentMonsters);

        state.Monsters.ForEach((ObjectId: string, monster: Monster) => {
            if (!this._currentMonsters.has(ObjectId)) {
                join.set(ObjectId, monster);
            }
            leave.delete(ObjectId);
        });

        join.forEach((monster: Monster, ObjectId: string) => this.OnCreateMonster(ObjectId, monster));

        leave.forEach((monster: Monster, ObjectId: string) => this.OnDeleteMonster(ObjectId, monster));
    }

    private OnCreateMonster(ObjectId: string, monster: Monster) {
        this._currentMonsters.set(ObjectId, monster);
        //create monster
        const prefabObj = Resources.Load(monster.Name) as GameObject;
        //const newObj:GameObject = Object.Instantiate(prefabObj, spawnPosition, spawnRotation) as GameObject;
    }

    private OnDeleteMonster(ObjectId: string, monster: Monster) {
        this._currentMonsters.delete(ObjectId);
        //destroy monster
    }
}