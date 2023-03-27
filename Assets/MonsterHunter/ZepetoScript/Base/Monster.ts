import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Entity from "./Entity";
import { IMonster } from "./IMonster";
import {RoomData} from "ZEPETO.Multiplay";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';

export default class Monster extends Entity implements IMonster {
    @SerializeField() protected rewardExp:number;
    @SerializeField() protected rewardCoin:number;
    
    Start(){
    }
    
    constructor(objectId: string, maxHp: number) {
        super(objectId, maxHp);
        this.SetEntity(objectId,maxHp);
    }

    SetEntity(objectId:string, maxHp:number){
        const data = new RoomData();
        data.Add("ObjectId", objectId);
        data.Add("isMonster", true);
        data.Add("MaxHp", maxHp);
        MultiplayManager.instance.room.Send("SetEntity", data);
    }
    
    Attack(target: Entity) {
        console.log(`${this.name} attacks ${target.name}.`);
        target.TakeDamage(10);
    }

}