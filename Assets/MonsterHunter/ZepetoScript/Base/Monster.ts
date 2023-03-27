import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Entity } from "./Entity";
import { IMonster } from "./IMonster";

export class Monster extends Entity implements IMonster {
    constructor(name: string, health: number) {
        super(name, health);
    }

    attack(target: Entity) {
        console.log(`${this.name} attacks ${target.name}.`);
        target.takeDamage(10);
    }

    roar() {
        console.log(`${this.name} roars loudly.`);
    }
}