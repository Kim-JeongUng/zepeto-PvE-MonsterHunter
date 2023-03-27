import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Entity from "./Entity";
import { IMonster } from "./IMonster";
import {RoomData} from "ZEPETO.Multiplay";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';

export default class Monster extends Entity implements IMonster {
    @SerializeField() protected rewardExp;
    @SerializeField() protected rewardCoin;
    
    Start(){
    }
    
    constructor(ObjectId: string, MaxHp: number) {
        super(ObjectId, MaxHp);
        this.SetEntity();
    }

    SetEntity(){
        const data = new RoomData();
        data.Add("ObjectId", this.GetComponent<TransformSyncHelper>().Id);
        data.Add("MaxHp", 10);
        MultiplayManager.instance.room.Send("SetEntity", data);
    }
    
    Attack(target: Entity) {
        console.log(`${this.name} attacks ${target.name}.`);
        target.TakeDamage(10);
    }

}