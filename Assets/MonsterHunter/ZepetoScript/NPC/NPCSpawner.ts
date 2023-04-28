import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {SpawnInfo, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {WorldService} from "ZEPETO.World";

export default class NPCSpawner extends ZepetoScriptBehaviour {

    Start() {
        const spawnInfo = new SpawnInfo();
        spawnInfo.position = this.transform.position;
        spawnInfo.rotation = this.transform.rotation;
        ZepetoPlayers.instance.CreatePlayerWithUserId("",spawnInfo, false);
    }

}