import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider} from "UnityEngine";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import {RoomData} from "ZEPETO.Multiplay";

export default class Sword extends ZepetoScriptBehaviour {

    Start() {    

    }
    
    // only can trig enemy (layer setting) 
    private OnTriggerEnter(coll: Collider) {

        const data = new RoomData();
        data.Add("objectId", coll.GetComponent<TransformSyncHelper>().Id);
        data.Add("quantity", 10);

        MultiplayManager.instance.room.Send("DamageToMonster", data);
    }
    
}