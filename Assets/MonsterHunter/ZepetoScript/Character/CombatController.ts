import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoCharacter, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {GameObject, AnimationClip, WaitForSeconds, Resources, Collider} from "UnityEngine";
import {Button} from "UnityEngine.UI";
import Entity from "../Base/Entity";
import Sword from '../Equipment/Sword';
import {Room, RoomData} from "ZEPETO.Multiplay";
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import LeaderBoardManager from '../../../Zepeto LeaderBoard Module/ZepetoScript/LeaderBoardManager';
import {DataEnum} from '../Manager/DataManager';

export default class CombatController extends Entity {
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
        const Id = this._room.SessionId;
        this._room.AddMessageHandler("OnReward"+Id, (reward:IMonsterData) => {
            LeaderBoardManager.instance.SendScore(1);
            this.GetExpReward(reward.RewardExp);
            this.GetCurrencyReward(reward.RewardCurrency);
        });
    }
    
    Attack(target: Entity) {
    //     console.log(`${this.name} attacks ${target.name}.`);
    //     target.TakeDamage(10);
    }
    
    
    public AttackMonster(coll:Collider){
        const monsterObjId :string = coll.GetComponent<TransformSyncHelper>().Id;
        this._room.Send("TakeDamageToMonster", monsterObjId);
    }
    
    public SetCharacterData(characterData: Map<string, number> ){
        this.maxHp = characterData.get(DataEnum.MaxHp);
        this.hp = this.maxHp;
        this.attackPower = characterData.get(DataEnum.AD);
        this.skillPower = 100;
        
    }
    
    private GetExpReward(quantity:number){
        this._room.Send("GainExp", quantity);
    }

    private GetCurrencyReward(quantity:number){
        const data = new RoomData();
        data.Add("currencyId", "energy");
        data.Add("quantity", quantity);

        this._room.Send("onCredit", data.GetObject());
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

interface IMonsterData {
    Name : string;
    MaxHp : number;
    Power : number;
    //reward
    RewardCurrency: number;
    RewardExp: number;
}