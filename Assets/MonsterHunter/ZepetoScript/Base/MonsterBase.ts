import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {RoomData} from "ZEPETO.Multiplay";
import {Animator, WaitUntil} from "UnityEngine";
import {Slider} from "UnityEngine.UI";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import {State, Monster} from "ZEPETO.Multiplay.Schema";
export default class MonsterBase extends ZepetoScriptBehaviour  {
    public gameEntity : Monster;
    
    @SerializeField() protected HpSlider: Slider;
    @SerializeField() protected maxHp: number;
    @SerializeField() protected hp: number;
    @SerializeField() protected animator: Animator;

    public Start(){
        if(this.gameEntity) {
            this.maxHp =  this._gameEntity?.Hp;
            this.OnChangeEntity();
            this.gameEntity?.add_OnChange(() => {
                this.OnChangeEntity();
            });
        }
        this.animator = this.GetComponentInChildren<Animator>();
    }

    private OnChangeEntity(){
        if( !this._gameEntity ){
            console.log("die?");
            return;
        }
        
        this.hp = this._gameEntity?.Hp;
        console.log("Change Entity "+this.hp);
        this.SetHPbarUI();

        const isOwner = this.GetComponent<TransformSyncHelper>().isOwner;
        if(isOwner && this.hp === 0){
            this.StartCoroutine(this.OnDie());
        }

    }

    private SetHPbarUI(){
        //TODO : HP UI animation 구현
        this.HpSlider.value = this.hp / this.maxHp;
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