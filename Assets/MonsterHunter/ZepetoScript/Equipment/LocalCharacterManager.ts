import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Collider, Quaternion, Vector3} from "UnityEngine";
import {ZepetoCharacter, ZepetoPlayers} from "ZEPETO.Character.Controller";
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import CombatController from '../Character/CombatController';
import {Room} from "ZEPETO.Multiplay";

export default class LocalCharacterManager extends ZepetoScriptBehaviour {
    private readonly DataSet: string[] = ['MaxHp', 'AD', 'Level', 'Exp'];

    public characterData : Map<string, number> = new Map<string, number>();
    @SerializeField() private itemName:string = "Hero_Sword";
    private _localCharacter:ZepetoCharacter;
    private _room: Room;
    
    private Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            this._room = MultiplayManager.instance?.room;
            
            // TODO: load Data base
            this.EquipItem(this.itemName);
            this.LoadDataStorage();
            
            this._localCharacter.gameObject.AddComponent<CombatController>();

            this._room.AddMessageHandler("StorageResult", (message) => {
                console.log("Get Success");
                this.DataSet.forEach(key => {
                    
                    const value = message[key];
                    if(value === undefined){
                        this.SetBasicStorage();
                    }
                    console.log(key+":"+value);
                });
            });
        });
    }

    private LoadDataStorage(){
        this._room.Send("MGetDataStorage",this.DataSet);
    }
    
    private SetDataStorage(storageMessage?:Map<string, number>){
        // enum의 모든 value값
        // this._room.Send("GetDataStorage",Object.values(DataSet));
        // this._room.AddMessageHandler("StorageResult", (message) => {
        //     console.log("Get Success");
        //     values.forEach(key => {
        //         const value = message[key];
        //         console.log(key+":"+value);
        //     });
        // });
        this._room.Send("SetDataStorage",storageMessage);
    }

    private SetBasicStorage(){
        const basicStorage : Map<string, number> = new Map<string, number>();
        basicStorage.set("MaxHp",100);
        basicStorage.set("AD",10);
        basicStorage.set("Level",1);
        basicStorage.set("Exp",0);
        console.log("send basic");
        this.SetDataStorage(basicStorage);
    }
    
    private EquipItem(itemName:string) {
        MultiplayManager.instance.Instantiate(itemName, MultiplayManager.instance?.room.SessionId,Vector3.zero, Quaternion.identity);
    }
    
}