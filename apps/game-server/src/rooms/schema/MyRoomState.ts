import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string")
  sessionId: string = "";

  @type("number")
  lettersTyped: number = 0;

  @type("string")
  text: string = "";
}

export class MyRoomState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type("string")
  currentTurn: string = "";

  @type("boolean")
  gameStarted: boolean = false;
}