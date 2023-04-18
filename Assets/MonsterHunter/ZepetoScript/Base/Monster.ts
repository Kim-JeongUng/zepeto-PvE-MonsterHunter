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
    
    constructor(isMonster:boolean) {
        super(true);
    }
    
    Attack(target: Entity) {
        console.log(`${this.name} attacks ${target.name}.`);
        target.TakeDamage(10);
    }
    
    OnDie(){
        super.OnDie();
        
    }

}