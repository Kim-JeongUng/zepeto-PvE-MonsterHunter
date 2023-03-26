import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Quaternion, Vector3} from "UnityEngine";
import {ZepetoCharacter, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import CombatController from '../Character/CombatController';

export default class LocalCharacterManager extends ZepetoScriptBehaviour {
    @SerializeField() private itemName:string = "Hero_Sword";
    private _localCharacter:ZepetoCharacter;
    
    private Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;

            // TODO: load Data base
            this.EquipItem(this.itemName);
            
            this._localCharacter.gameObject.AddComponent<CombatController>();
        });
    }

    private EquipItem(itemName:string) {
        MultiplayManager.instance.Instantiate(itemName, MultiplayManager.instance?.room.SessionId,Vector3.zero, Quaternion.identity);
    }
}