import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Quaternion, Vector3} from "UnityEngine";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';

export default class EquipItemManager extends ZepetoScriptBehaviour {
    @SerializeField() private itemName:string = "Hero_Sword";
    
    private Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            // TODO: load Data base
            
            this.EquipItem(this.itemName);
        });
    }

    private EquipItem(itemName:string) {
        MultiplayManager.instance.Instantiate(itemName, MultiplayManager.instance?.room.SessionId,Vector3.zero, Quaternion.identity);
    }
}