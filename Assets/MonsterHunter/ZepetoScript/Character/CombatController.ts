import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoCharacter, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {GameObject, AnimationClip, WaitForSeconds, Resources, Collider} from "UnityEngine";
import {Button} from "UnityEngine.UI";
import Entity from "../Base/Entity";
import Sword from '../Equipment/Sword';
import {Room, RoomData} from "ZEPETO.Multiplay";
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';

export default class CombatController extends Entity {
    public characterData : Map<string, number> = new Map<string, number>();
    private readonly DataSet: string[] = [DataEnum.MaxHp, DataEnum.AD, DataEnum.Level, DataEnum.Exp];

    @SerializeField() private animationClip : AnimationClip;
    private _localCharacter: ZepetoCharacter;
    private _attackBtn : Button;
    private _attackFlag : boolean = false;
    private _localSword : Collider;
    private _room: Room;

    constructor(isMonster:boolean) {
        super(false);
    }

    public Start() {
        super.Start();
        this.OnLocalCharacterLoaded();
        this._localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        this.animationClip = Resources.Load("Slash1") as AnimationClip;

        this._room = MultiplayManager.instance.room;
        
        this.GetAllPlayerData();
        
        this._room.AddMessageHandler("onGetAllPlayerDataResult", (message) => {
            console.log("Get Success");
            for(let key of this.DataSet)
                this.characterData.set(key, message[key]);
            this.SetCharacterData();
        });
    }
    Attack(target: Entity) {
        console.log(`${this.name} attacks ${target.name}.`);
        target.TakeDamage(10);
    }
    
    public AttackMonster(coll:Collider){
        console.log("Attack");
        const data = new RoomData();
        data.Add("attacker", this.GetComponent<TransformSyncHelper>().Id);
        data.Add("victim", coll.GetComponent<TransformSyncHelper>().Id);
        data.Add("quantity", this.attackPower);

        this._room.Send("TakeDamage", data.GetObject());
    }
    
    private GetAllPlayerData(){
        this._room.Send("GetAllPlayerData");
    }
    public SetDataStorage(key, value){
        const data = new RoomData();
        data.Add("key", key);
        data.Add("value", value);
        this._room.Send("onSetStorage",data.GetObject());
    }
    
    private SetCharacterData(){
        
        this.maxHp = this.characterData.get(DataEnum.MaxHp);
        this.hp = this.maxHp;
        this.attackPower = this.characterData.get(DataEnum.AD);
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
export enum DataEnum{
    MaxHp = "MaxHp",
    AD = 'AD', 
    Level = 'Level',
    Exp ='Exp'
}