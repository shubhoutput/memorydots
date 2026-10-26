"use client";

import { useEffect, useState } from "react";
import { Client } from "@colyseus/sdk";

type PlayerData = {
  sessionId: string;
  lettersTyped: number;
  text: string;
};

export default function Home() {
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [currentTurn, setCurrentTurn] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const connect = async () => {
      try {
        const client = new Client("http://localhost:2567");

        const joinedRoom = await client.joinOrCreate("my_room");

        console.log("Connected!");
        console.log("Room ID:", joinedRoom.roomId);
        console.log("Session ID:", joinedRoom.sessionId);

        setRoom(joinedRoom);

        joinedRoom.onStateChange((state: any) => {
          console.log("Game state:", state);

          const playerList: PlayerData[] = [];

          state.players.forEach((player: any, sessionId: string) => {
            playerList.push({
              sessionId,
              lettersTyped: player.lettersTyped,
              text: player.text,
            });
          });

          setPlayers(playerList);
          setCurrentTurn(state.currentTurn);
          setGameStarted(state.gameStarted);
        });
      } catch (err) {
        console.error("Colyseus connection failed:", err);
        setError("Failed to connect to game server");
      }
    };

    connect();
  }, []);

  const mySessionId = room?.sessionId;

  const myPlayerNumber =
    players.findIndex(
      (player) => player.sessionId === mySessionId
    ) + 1;

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Colyseus Turn-Based Game</h1>

      {error && <p>{error}</p>}

      {!room && !error && <p>Connecting...</p>}

      {room && (
        <>
          <hr />

          <h2>Connection</h2>

          <p>
            <strong>Room ID:</strong> {room.roomId}
          </p>

          <p>
            <strong>My Session ID:</strong> {room.sessionId}
          </p>

          <p>
            <strong>I am:</strong> Player {myPlayerNumber}
          </p>

          <hr />

          <h2>Game</h2>

          <p>
            <strong>Game started:</strong>{" "}
            {gameStarted ? "Yes" : "Waiting for Player 2"}
          </p>

          <p>
            <strong>Current turn:</strong>{" "}
            {currentTurn
              ? currentTurn === room.sessionId
                ? "Me"
                : "Other Player"
              : "None"}
          </p>

          <hr />

          <h2>Players</h2>

          {players.map((player, index) => (
            <div
              key={player.sessionId}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "10px",
              }}
            >
              <p>
                <strong>Player {index + 1}</strong>
              </p>

              <p>
                Session ID: {player.sessionId}
              </p>

              <p>
                Letters typed: {player.lettersTyped}
              </p>

              <p>
                Text: {player.text || "(empty)"}
              </p>

              <p>
                {player.sessionId === currentTurn
                  ? "🟢 Their turn"
                  : "⚪ Waiting"}
              </p>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
