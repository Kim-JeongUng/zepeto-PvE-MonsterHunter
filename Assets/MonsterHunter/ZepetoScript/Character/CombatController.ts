import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoCharacter, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {GameObject, AnimationClip, WaitForSeconds, Resources, Collider} from "UnityEngine";
import {Button} from "UnityEngine.UI";
import Entity from "../Base/Entity";
import Sword from '../Equipment/Sword';
import {RoomData} from "ZEPETO.Multiplay";
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';

export default class CombatController extends Entity {
    constructor(isMonster:boolean) {
        super(false);
    }

    Attack(target: Entity) {
        console.log(`${this.name} attacks ${target.name}.`);
        target.TakeDamage(10);
    }
    
    @SerializeField() private animationClip : AnimationClip;
    private _localCharacter: ZepetoCharacter;
    private _attackBtn : Button;
    private _attackFlag : boolean = false;
    private _localSword : Collider;

    public Start() {
        super.Start();
        this.OnLocalCharacterLoaded();
        this._localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        this.animationClip = Resources.Load("Slash1") as AnimationClip;
        this.StartCoroutine(this.LoadDataStroage());
    }
    
    public AttackMonster(coll:Collider){
        
        const data = new RoomData();
        data.Add("attacker", this.GetComponent<TransformSyncHelper>().Id);
        data.Add("victim", coll.GetComponent<TransformSyncHelper>().Id);
        data.Add("quantity", this.attackPower);

        MultiplayManager.instance.room.Send("TakeDamage", data.GetObject());
    }
    
    private * LoadDataStroage(){
        //TODO Load Data Storage
        yield new WaitForSeconds(0.1);
        this.maxHp = 100;
        this.hp = 100;
        this.attackPower = 100;
        this.skillPower = 100;
        this.SetEntity();
    }
    
    private OnLocalCharacterLoaded(){
        this._attackBtn = GameObject.Find("AttackBtn").GetComponent<Button>() as Button;
        this._attackBtn.onClick.AddListener(() => {
            this.StartCoroutine(this.DoCharacterAttack());
        });
    }
    
    private * DoCharacterAttack(){
        if(!this._localSword){
            const sword = this._localCharacter.GetComponentInChildren<Sword>().gameObject;
            this._localSword = sword.GetComponent<Collider>();
        }
        if(!this._attackFlag) {
            this._attackFlag = true;
            this._localCharacter.SetGesture(this.animationClip);
            this._localSword.enabled = true;
            yield new WaitForSeconds(this.animationClip.length);
            this._localSword.enabled = false;
            this._attackFlag = false;
        }
    }
    

}