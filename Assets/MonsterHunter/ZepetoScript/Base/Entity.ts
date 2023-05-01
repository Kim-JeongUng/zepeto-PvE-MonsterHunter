import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Object, WaitUntil, WaitForSeconds, Animator, GameObject} from "UnityEngine";
import {RoomData} from "ZEPETO.Multiplay";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import {State} from "ZEPETO.Multiplay.Schema";
import {ZepetoWorldMultiplay} from "ZEPETO.World";

export default abstract class Entity extends ZepetoScriptBehaviour{
    @SerializeField() protected maxHp: number;
    @SerializeField() protected hp: number;
    @SerializeField() protected attackPower: number;
    @SerializeField() protected skillPower: number;
    @SerializeField() protected animator: Animator;
    
    protected isMonster: boolean;
    
    
    constructor(isMonster :boolean) {
        super();
        this.isMonster = isMonster;
    }

    public Start(){
        this.StartCoroutine(this.WaitRoom());
        this.animator = this.GetComponentInChildren<Animator>();
    }
    
    private *WaitRoom(){
        yield new WaitUntil(()=>MultiplayManager.instance.room != null );
        
        const objId = this.GetComponent<TransformSyncHelper>().Id;
        //
        // if(MultiplayManager.instance.room.State.GameEntities?.get_Item(objId) == null ) {
        //     //this.SetEntity(objId);
        //     yield new WaitUntil(() =>MultiplayManager.instance.room.State.GameEntities?.get_Item(objId) != null);
        // }
        
        //this._gameEntity = MultiplayManager.instance.room.State.GameEntities?.get_Item(objId);
        
        //TODO : HP변경         
        // this.OnChangeEntity();
        // this._gameEntity.add_OnChange(() => {
        //     this.OnChangeEntity();
        // });
    }

    private OnChangeEntity(){
            
        //this.hp = this._gameEntity.Hp;
        console.log("Change Entity "+this.hp);
        this.SetHPbarUI();
        
        const isOwner = this.GetComponent<TransformSyncHelper>().isOwner;
        if(isOwner && this.hp === 0){
            this.StartCoroutine(this.OnDie());
        }
    }
    
    private SetHPbarUI(){
        //TODO : HP UI 구현
    }
    
    //서버에서 내려주는 형식으로 변경
    // protected SetEntity(objId?:string){
    //     const data = new RoomData();
    //     data.Add("ObjectId", objId ?? this.GetComponent<TransformSyncHelper>().Id);
    //     data.Add("isMonster", this.isMonster);
    //     data.Add("MaxHp", this.maxHp);
    //     MultiplayManager.instance.room.Send("SetEntity", data.GetObject());
    // }

    abstract Attack(target: Entity): void;

    protected * OnDie(){
        console.log("die");
        // reward
        
        // Death anim 
        this.animator.Play("Die");
        
    }
    
    
    GainHp(quantity: number) {
        this.hp = this.hp + quantity > this.maxHp ?  this.hp + quantity : this.maxHp;
    }
}