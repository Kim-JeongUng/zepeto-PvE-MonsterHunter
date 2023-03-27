import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Entity } from "../Base/Entity";
import { Monster } from "../Base/Monster";

export class Dragon extends Monster {
    constructor(name: string, health: number) {
        super(name, health);
    }

    attack(target: Entity) {
        console.log(`${this.name} breathes fire at ${target.name}.`);
        target.takeDamage(20);
    }
}