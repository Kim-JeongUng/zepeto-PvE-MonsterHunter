import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {WaitUntil} from "UnityEngine";
import {RoomData} from "ZEPETO.Multiplay";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import {State, GameEntity} from "ZEPETO.Multiplay.Schema";

export default abstract class Entity extends ZepetoScriptBehaviour{
    @SerializeField() protected maxHp: number;
    @SerializeField() protected hp: number;
    @SerializeField() protected attackPower: number;
    @SerializeField() protected skillPower: number;
    @SerializeField() protected isMonster: boolean;
    
    private _gameEntity :GameEntity;
    
    constructor(isMonster :boolean) {
        super();
        this.isMonster = isMonster;
    }

    protected Start(){
        this.WaitRoom();
    }
    
    private *WaitRoom(){
        yield new WaitUntil(()=>MultiplayManager.instance.room != null );

        MultiplayManager.instance.room.OnStateChange += this.OnStateChange;
    }


    // Access the entire server schema at first startup and connect the sync Id schema.
    private OnStateChange(state: State, isFirst: boolean) {
        if (null == this._gameEntity) {
            const objId = this.GetComponent<TransformSyncHelper>().Id;
            this._gameEntity = state.GameEntities.get_Item(objId);
            if (this._gameEntity) {
                this.OnChangeEntity();
    
                this._gameEntity.add_OnChange(() => {
                    this.OnChangeEntity();
                });
                MultiplayManager.instance.room.OnStateChange -= this.OnStateChange;
            } else {
                // Initial definition if not defined on the server              
                this.StartCoroutine(this.SetEntity(objId));
            }
        }
    }
    
    private OnChangeEntity(){
        console.log("Change Entity");
    }
    
    private * SetEntity(objId:string){
        const data = new RoomData();
        data.Add("ObjectId", objId);
        data.Add("isMonster", this.isMonster);
        data.Add("MaxHp", this.maxHp);
        MultiplayManager.instance.room.Send("SetEntity", data.GetObject());
    }

    abstract Attack(target: Entity): void;

    TakeDamage(quantity: number) {
        this.hp -= quantity;
        if (this.hp <= 0) {
            console.log(`${this.name} has been defeated.`);
        }
    }
    
    GainHp(quantity: number) {
        this.hp = this.hp + quantity > this.maxHp ?  this.hp + quantity : this.maxHp;
    }
}