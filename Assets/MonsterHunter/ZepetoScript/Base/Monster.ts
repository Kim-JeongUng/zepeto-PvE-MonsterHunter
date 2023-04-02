import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Entity from "./Entity";
import { IMonster } from "./IMonster";
import {RoomData} from "ZEPETO.Multiplay";
import {WaitUntil} from "UnityEngine";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';

export default class Monster extends Entity implements IMonster {
    @SerializeField() protected rewardExp:number;
    @SerializeField() protected rewardCoin:number;
    
    Start(){
        this.StartCoroutine(this.SetEntity());
    }
    
    constructor(objectId: string, maxHp: number) {
        super(objectId, maxHp);
    }

    private * SetEntity(){
        yield new WaitUntil(()=>MultiplayManager.instance.room != null )
        const objId = this.GetComponent<TransformSyncHelper>().Id;
        const data = new RoomData();
        data.Add("ObjectId", objId);
        data.Add("isMonster", true);
        data.Add("MaxHp", this.maxHp);
        MultiplayManager.instance.room.Send("SetEntity", data.GetObject());
    }
    
    Attack(target: Entity) {
        console.log(`${this.name} attacks ${target.name}.`);
        target.TakeDamage(10);
    }

}