import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export abstract class Entity extends ZepetoScriptBehaviour{
    private _name: string;
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
    health: number;

    constructor(name: string, health: number) {
        super();
        this.name = name;
        this.health = health;
    }

    abstract attack(target: Entity): void;

    takeDamage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
            console.log(`${this.name} has been defeated.`);
        }
    }
}