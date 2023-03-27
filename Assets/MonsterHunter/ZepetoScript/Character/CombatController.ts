import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoCharacter, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {GameObject, AnimationClip, WaitForSeconds, Resources} from "UnityEngine";
import {Button} from "UnityEngine.UI";
import Entity from "../Base/Entity";

export default class CombatController extends Entity {
    constructor(name: string, health: number) {
        super(name, health);
    }

    Attack(target: Entity) {
        console.log(`${this.name} attacks ${target.name}.`);
        target.TakeDamage(10);
    }
    
    @SerializeField() private animationClip : AnimationClip;
    private _localCharacter: ZepetoCharacter;
    private _attackBtn : Button;
    private _attackFlag : boolean = false;
    
    Start() {
        this.OnLocalCharacterLoaded();
        this._localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        this.animationClip = Resources.Load("Slash1") as AnimationClip;
    }
    
    private OnLocalCharacterLoaded(){
        this._attackBtn = GameObject.Find("AttackBtn").GetComponent<Button>() as Button;
        this._attackBtn.onClick.AddListener(() => {
            this.StartCoroutine(this.DoCharacterAttack());
        });
    }
    
    private * DoCharacterAttack(){
        if(!this._attackFlag) {
            this._attackFlag = true;
            this._localCharacter.SetGesture(this.animationClip);

            yield new WaitForSeconds(this.animationClip.length);
            this._attackFlag = false;
        }
    }
    

}