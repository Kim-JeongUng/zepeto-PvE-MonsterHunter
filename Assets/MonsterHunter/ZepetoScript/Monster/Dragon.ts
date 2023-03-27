import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Entity from "../Base/Entity";
import Monster from "../Base/Monster";
import {RoomData} from "ZEPETO.Multiplay";

export class Dragon extends Monster {
    constructor(name: string, health: number) {
        super(name, health);
    }
    
    Attack(target: Entity) {
        console.log(`${this.name} breathes fire at ${target.name}.`);
        target.TakeDamage(this.attackDamage);
    }
}