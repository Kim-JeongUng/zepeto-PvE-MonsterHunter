import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider} from "UnityEngine";
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import {RoomData} from "ZEPETO.Multiplay";
import CombatController from '../Character/CombatController';

export default class Sword extends ZepetoScriptBehaviour {

    private _combatController : CombatController;
    Start() {    
        this._combatController = this.GetComponent<CombatController>();
    }
    
    // only can trig enemy (layer setting) 
    private OnTriggerEnter(coll: Collider) {        
        this._combatController.AttackMonster(coll);
    }
}