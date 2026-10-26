import { Room, Client } from "colyseus";
import { MyRoomState, Player } from "./schema/MyRoomState.js";

export class MyRoom extends Room {
  declare state: MyRoomState;

  onCreate() {
    this.state = new MyRoomState();
  }

  onJoin(client: Client) {
    const player = new Player();

    player.sessionId = client.sessionId;

    this.state.players.set(client.sessionId, player);

    if (this.state.players.size === 1) {
      this.state.currentTurn = client.sessionId;
    }

    if (this.state.players.size === 2) {
      this.state.gameStarted = true;
    }
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}