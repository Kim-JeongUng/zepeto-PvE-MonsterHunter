declare module "ZEPETO.Multiplay.Schema" {

	import { Schema, MapSchema, ArraySchema } from "@colyseus/schema"; 


	interface State extends Schema {
		players: MapSchema<Player>;
		SyncTransforms: MapSchema<SyncTransform>;
		Monsters: MapSchema<Monster>;
	}
	class Player extends Schema {
		sessionId: string;
		zepetoHash: string;
		zepetoUserId: string;
		playerAdditionalValue: PlayerAdditionalValue;
		animationParam: ZepetoAnimationParam;
		gestureName: string;
		MaxHp: number;
		Hp: number;
		AD: number;
	}
	class sVector3 extends Schema {
		x: number;
		y: number;
		z: number;
	}
	class sQuaternion extends Schema {
		x: number;
		y: number;
		z: number;
		w: number;
	}
	class SyncTransform extends Schema {
		Id: string;
		position: sVector3;
		localPosition: sVector3;
		rotation: sQuaternion;
		scale: sVector3;
		status: number;
		sendTime: number;
	}
	class PlayerAdditionalValue extends Schema {
		additionalWalkSpeed: number;
		additionalRunSpeed: number;
		additionalJumpPower: number;
	}
	class ZepetoAnimationParam extends Schema {
		State: number;
		MoveState: number;
		JumpState: number;
		LandingState: number;
		MotionSpeed: number;
		FallSpeed: number;
		Acceleration: number;
		MoveProgress: number;
	}
	class Monster extends Schema {
		ObjectId: string;
		SpawnPoint: number;
		Name: string;
		Hp: number;
	}
}