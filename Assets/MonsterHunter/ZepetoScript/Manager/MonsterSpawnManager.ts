import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Monster, State} from "ZEPETO.Multiplay.Schema";
import {GameObject, Object, Resources, Vector3, Quaternion, WaitForSeconds} from "UnityEngine";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room} from "ZEPETO.Multiplay";
import TransformSyncHelper from "../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper";
import MonsterBase from "../Base/MonsterBase";
import Golem from "../Monster/Golem";

export default class MonsterSpawnManager extends ZepetoScriptBehaviour {
    @SerializeField() private spawnPoints:Vector3[] = []; 
    @SerializeField() private temp:GameObject;
    
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    
    private _currentMonsters: Map<string, Monster> = new Map<string, Monster>(); //서버 데이터
    private _currentMonstersObj: Map<string, GameObject> = new Map<string, GameObject>(); //게임오브젝트
    
    Start() {
        // const obj = Object.Instantiate(this.temp) as GameObject;
        // console.log(obj.tag);
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
        //create monster
        
        const prefabObj = Resources.Load(monster.Name) as GameObject;
        const newObj =Object.Instantiate(prefabObj, this.spawnPoints[0], Quaternion.identity) as GameObject;
        
        if(newObj !== null || newObj !== undefined ) {
            console.log(ObjectId + " spawn!");
            this._currentMonsters.set(ObjectId, monster);
            this._currentMonstersObj.set(ObjectId, newObj);
            newObj.GetComponent<TransformSyncHelper>().Id = monster.ObjectId;
            //오브젝트 설정
        }
        else
            console.log(monster.Name+"is null");
        
        
    }

    private OnDeleteMonster(ObjectId: string, monster: Monster) {
        Object.Destroy(this._currentMonstersObj.get(ObjectId));
        this._currentMonsters.delete(ObjectId);
        this._currentMonstersObj.delete(ObjectId);
        //destroy monster
    }
}