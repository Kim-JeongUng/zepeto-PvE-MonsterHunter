import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider} from "UnityEngine";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import {RoomData} from "ZEPETO.Multiplay";
import CombatController from '../Character/CombatController';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';

export default class Sword extends ZepetoScriptBehaviour {

    private _combatController : CombatController;
    private _isLocal : boolean = false;
    Start() {
        this._isLocal = this.GetComponent<TransformSyncHelper>().isOwner;
    }
    
    // only can trig enemy (layer setting) 
    private OnTriggerEnter(coll: Collider) {
        if(!this._isLocal)
            return;
        
        this._combatController ??= this.GetComponentInParent<CombatController>();
        this._combatController.AttackMonster(coll);
    }
}