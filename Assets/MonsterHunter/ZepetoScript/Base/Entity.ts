import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default abstract class Entity extends ZepetoScriptBehaviour{
    private _name: string;
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
    maxHp: number;
    hp: number;
    
    constructor(objectId: string, maxHp: number) {
        super();
        this.name = objectId;
        this.maxHp = maxHp;
        this.hp = maxHp;
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