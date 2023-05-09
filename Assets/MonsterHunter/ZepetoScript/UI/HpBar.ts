import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoCamera, ZepetoPlayers } from 'ZEPETO.Character.Controller'
import { Slider } from 'UnityEngine.UI';
import { Time, Mathf, Vector3, GameObject } from 'UnityEngine';

export default class HPBar extends ZepetoScriptBehaviour {
    @SerializeField() private HpSlider: Slider;
    @SerializeField() private hpFillImage: GameObject;
    
    private _zepetoCamera : ZepetoCamera;
    private _maxHP: number = 100;
    private _currentHP: number = 100;
    private _targetHP: number = 100;
    private _lerpSpeed: number = 5.0;
    private _isDamaged: boolean = false;

    Start() {
        this._zepetoCamera = ZepetoPlayers.instance.ZepetoCamera;
    }

    Update() {
        
        this.UpdateHpBarRotation();
        
        // if (this._isDamaged) {
        //     this._currentHP = Mathf.Lerp(this._currentHP, this._targetHP, Time.deltaTime * this._lerpSpeed);
        //     if (Mathf.Abs(this._currentHP - this._targetHP) < 0.1) {
        //         this._isDamaged = false;
        //     }
        // }
    }

    TakeDamage(amount: number) {
        this._isDamaged = true;
        this._targetHP = Mathf.Clamp(this._targetHP - amount, 0, this._maxHP);
    }
    
    public SetHpBar(value:number){
        this.HpSlider.value = value;
        this.hpFillImage.SetActive(value > 0);
    }

    private UpdateHpBarRotation() {
        this.transform.LookAt(this._zepetoCamera.transform);
    }
}





