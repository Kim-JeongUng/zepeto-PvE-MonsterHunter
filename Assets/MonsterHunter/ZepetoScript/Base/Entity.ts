import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Object, WaitUntil} from "UnityEngine";
import {RoomData} from "ZEPETO.Multiplay";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import {State, GameEntity} from "ZEPETO.Multiplay.Schema";
import {ZepetoWorldMultiplay} from "ZEPETO.World";

export default abstract class Entity extends ZepetoScriptBehaviour{
    @SerializeField() protected maxHp: number;
    @SerializeField() protected hp: number;
    @SerializeField() protected attackPower: number;
    @SerializeField() protected skillPower: number;
    protected isMonster: boolean;
    
    private _gameEntity :GameEntity;
    
    constructor(isMonster :boolean) {
        super();
        this.isMonster = isMonster;
    }

    public Start(){
        this.StartCoroutine(this.WaitRoom());
    }
    
    private *WaitRoom(){
        yield new WaitUntil(()=>MultiplayManager.instance.room != null );

        const objId = this.GetComponent<TransformSyncHelper>().Id;
        
        if(MultiplayManager.instance.room.State.GameEntities?.get_Item(objId) == null ) {
            this.SetEntity(objId);
            yield new WaitUntil(() =>MultiplayManager.instance.room.State.GameEntities?.get_Item(objId) != null);
        }
        
        this._gameEntity = MultiplayManager.instance.room.State.GameEntities?.get_Item(objId);
        this.OnChangeEntity();
        this._gameEntity.add_OnChange(() => {
            this.OnChangeEntity();
        });
    }

    private OnChangeEntity(){
        this.hp = this._gameEntity.Hp;
        console.log("Change Entity");
        console.log(this.hp);
    }
    
    private SetHPbarUI(){
        
    }
    
    protected SetEntity(objId?:string){
        const data = new RoomData();
        data.Add("ObjectId", objId ?? this.GetComponent<TransformSyncHelper>().Id);
        data.Add("isMonster", this.isMonster);
        data.Add("MaxHp", this.maxHp);
        MultiplayManager.instance.room.Send("SetEntity", data.GetObject());
    }

    abstract Attack(target: Entity): void;

    TakeDamage(quantity: number) {
        this.hp -= quantity;
        if (this.hp <= 0) {
            console.log(`${this.name} has been defeated.`);
            this.OnDie();
        }
    }

    protected OnDie(){
        console.log("die");
    }
    
    GainHp(quantity: number) {
        this.hp = this.hp + quantity > this.maxHp ?  this.hp + quantity : this.maxHp;
    }
}