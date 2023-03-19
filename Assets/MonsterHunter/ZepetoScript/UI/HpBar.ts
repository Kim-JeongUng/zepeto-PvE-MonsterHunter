import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Image } from 'UnityEngine.UI';
import { Time, Mathf } from 'UnityEngine';

export default class HPBar extends ZepetoScriptBehaviour {
    @SerializeField() private _fillImage: Image;
    @SerializeField() private _maxHP: number = 100;
    private _currentHP: number = 100;
    private _targetHP: number = 100;
    private _lerpSpeed: number = 5.0;
    private _isDamaged: boolean = false;

    Start() {
        this.UpdateHPBar();
    }

    Update() {
        if (this._isDamaged) {
            this._currentHP = Mathf.Lerp(this._currentHP, this._targetHP, Time.deltaTime * this._lerpSpeed);
            this.UpdateHPBar();
            if (Mathf.Abs(this._currentHP - this._targetHP) < 0.1) {
                this._isDamaged = false;
            }
        }
    }

    TakeDamage(amount: number) {
        this._isDamaged = true;
        this._targetHP = Mathf.Clamp(this._targetHP - amount, 0, this._maxHP);
    }

    UpdateHPBar() {
        let fillAmount: number = this._currentHP / this._maxHP;
        this._fillImage.fillAmount = fillAmount;
    }
}





