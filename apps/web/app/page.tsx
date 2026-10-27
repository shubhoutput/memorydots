"use client";

import { useGameRoom } from "@/hooks/useGameRoom";

export default function Home() {
  const {
    status,
    roomId,
    sessionId,
    gameState,
    players,
  } = useGameRoom();

  const myPlayerNumber =
    players.findIndex(
      (player) => player.sessionId === sessionId
    ) + 1;

  const currentTurn = gameState?.currentTurn ?? "";

  const gameStarted = gameState?.gameStarted ?? false;

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Colyseus Turn-Based Game</h1>

      <hr />

      <h2>Connection</h2>

      <p>
        <strong>Status:</strong> {status}
      </p>

      <p>
        <strong>Room ID:</strong>{" "}
        {roomId || "Not connected"}
      </p>

      <p>
        <strong>My Session ID:</strong>{" "}
        {sessionId || "Not connected"}
      </p>

      <p>
        <strong>I am:</strong>{" "}
        {myPlayerNumber > 0
          ? `Player ${myPlayerNumber}`
          : "Not assigned"}
      </p>

      <hr />

      <h2>Game</h2>

      <p>
        <strong>Game started:</strong>{" "}
        {gameStarted
          ? "Yes"
          : "Waiting for Player 2"}
      </p>

      <p>
        <strong>Current turn:</strong>{" "}
        {currentTurn
          ? currentTurn === sessionId
            ? "Me"
            : "Other Player"
          : "None"}
      </p>

      <hr />

      <h2>Players</h2>

      {players.length === 0 && (
        <p>No players connected.</p>
      )}

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
    </main>
  );
}
