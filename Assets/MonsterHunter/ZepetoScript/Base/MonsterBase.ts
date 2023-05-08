import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {RoomData} from "ZEPETO.Multiplay";
import {Animator, WaitUntil} from "UnityEngine";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import {State, Monster} from "ZEPETO.Multiplay.Schema";
export default class MonsterBase extends ZepetoScriptBehaviour  {
    @SerializeField() protected maxHp: number;
    @SerializeField() protected hp: number;
    @SerializeField() protected animator: Animator;
    protected _gameEntity : Monster;

    public Start(){
        this.StartCoroutine(this.WaitRoom());
        this.animator = this.GetComponentInChildren<Animator>();
    }

    private *WaitRoom(){
        yield new WaitUntil(()=>MultiplayManager.instance.room != null );

        const objId = this.GetComponent<TransformSyncHelper>().Id;
        console.log(objId);
        this._gameEntity = MultiplayManager.instance.room.State.Monsters?.get_Item(objId);

        //TODO : HP변경         
        this.OnChangeEntity();
        this._gameEntity?.add_OnChange(() => {
            this.OnChangeEntity();
        });
    }

    private OnChangeEntity(){

        this.hp = this._gameEntity?.Hp;
        console.log("Change Entity "+this.hp);
        this.SetHPbarUI();

        const isOwner = this.GetComponent<TransformSyncHelper>().isOwner;
        if(isOwner && this.hp === 0){
            this.StartCoroutine(this.OnDie());
        }

        if( !this._gameEntity ){
            console.log("die?");
        }
    }

    private SetHPbarUI(){
        //TODO : HP UI 구현
    }

    protected * OnDie(){
        console.log("die");

        // Death anim 
        this.animator.Play("Die");
    }


    GainHp(quantity: number) {
        this.hp = this.hp + quantity > this.maxHp ?  this.hp + quantity : this.maxHp;
    }

}