import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {RoomData} from "ZEPETO.Multiplay";
import {Animator, WaitUntil, GameObject} from "UnityEngine";
import {Slider} from "UnityEngine.UI";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import TransformSyncHelper from '../../../Zepeto Multiplay Component/ZepetoScript/Transform/TransformSyncHelper';
import HpBar from '../UI/HpBar';
import {State, Monster} from "ZEPETO.Multiplay.Schema";
export default class MonsterBase extends ZepetoScriptBehaviour  {
    private gameEntity : Monster;
    
    @SerializeField() protected HpBarObject: GameObject;
    @SerializeField() protected maxHp: number;
    @SerializeField() protected hp: number;
    @SerializeField() protected animator: Animator;
    private hpBarScript : HpBar;
    public Start(){
        this.StartCoroutine(this.WaitRoom());
        this.animator = this.GetComponentInChildren<Animator>();
        this.hpBarScript = this.HpBarObject.GetComponentInChildren<HpBar>();
    }
    private *WaitRoom() {
        yield new WaitUntil(() => MultiplayManager.instance.room != null);

        const objId = this.GetComponent<TransformSyncHelper>().Id;
        this.gameEntity = MultiplayManager.instance.room.State.Monsters?.get_Item(objId);
        if(this.gameEntity) {
            this.maxHp = this.gameEntity.Hp;
            //TODO : HP변경         
            this.OnChangeEntity();
            this.gameEntity?.add_OnChange(() => {
                this.OnChangeEntity();
            });
        }
    }
    
    private OnChangeEntity(){
        if( !this.gameEntity ){
            console.log("die?");
            return;
        }
        
        this.hp = this.gameEntity?.Hp;
        console.log("Change Entity "+this.hp);
        this.SetHPbarUI();
        
        if(MultiplayManager.instance.isMasterClient && this.hp === 0){
            this.StartCoroutine(this.OnDie());
        }

    }

    private SetHPbarUI(){
        this.hpBarScript.SetHpBar(this.hp/this.maxHp);
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