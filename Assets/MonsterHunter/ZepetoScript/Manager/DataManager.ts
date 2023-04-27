import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {GameObject, WaitUntil} from "UnityEngine";
import {Room, RoomData} from "ZEPETO.Multiplay";
import {ZepetoPlayers, ZepetoCharacter} from "ZEPETO.Character.Controller";
import CombatController from '../Character/CombatController';
import MultiplayManager from '../../../Zepeto Multiplay Component/ZepetoScript/Common/MultiplayManager';
import UIBalances from '../../../Zepeto Product Module/ZepetoScript/UI/UIBalances';

export default class DataManager extends ZepetoScriptBehaviour {
    public characterData : Map<string, number> = new Map<string, number>();
    
    @SerializeField() private UIBalanceObj : GameObject;
    private _UIBalances : UIBalances;
    private _room: Room;
    private _localCharacter: ZepetoCharacter;
    
    
    /* Singleton */
    private static m_instance: DataManager = null;
    public static get instance(): DataManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<DataManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(DataManager.name).AddComponent<DataManager>();
            }
        }
        return this.m_instance;
    }
    private Awake() {
        if (DataManager.m_instance !== null && DataManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            DataManager.m_instance = this;
            GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }
    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this._UIBalances = this.UIBalanceObj.GetComponent<UIBalances>();
            
            this._room = MultiplayManager.instance.room;
            this._localCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            this.GetAllPlayerData();
            this._room.AddMessageHandler("onGetAllPlayerDataResult", (message) => {
                console.log("Get Success");
                Object.values(DataEnum).forEach((value) => {
                    this.characterData.set(value, message[value]);
                    console.log(value+":"+message[value]);
                });
                this._localCharacter.GetComponent<CombatController>().SetCharacterData(this.characterData);
                this._UIBalances.RefreshExpUI(this.characterData.get('Exp') as number, this.characterData.get('Level') as number);
            });
            
            this._room.AddMessageHandler("onSetStorageResult", (message) => {
                console.log("set Success");
                console.log(message);
            });
        });
    }

    private GetAllPlayerData(){
        this._room.Send("GetAllPlayerData");
    }
    
    public SetDataStorage(key, value){
        const data = new RoomData();
        data.Add("key", key);
        data.Add("value", value);
        this._room.Send("onSetStorage",data.GetObject());
    }

}
export enum DataEnum{
    MaxHp = "MaxHp",
    AD = 'AD',
    Level = 'Level',
    Exp ='Exp'
}