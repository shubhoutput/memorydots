
"use client";

import { useEffect, useState } from "react";
import { Client, Room, Callbacks } from "@colyseus/sdk";


let room: Room | null = null;
let connecting = false;

export function useGameRoom() {
    const [status, setStatus] = useState("connecting");
    const [roomId, setRoomId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [gameState, setGameState] = useState<any>(null);
    const [players, setPlayers] = useState<any[]>([]);

    useEffect(() => {
        async function connect() {
            // Already connected or currently connecting
            if (room || connecting) {
                if (room) {
                    setStatus("connected");
                    setRoomId(room.roomId);
                    setSessionId(room.sessionId);
                }
                return;
            }

            connecting = true;

            try {
                const client = new Client(
                    process.env.NEXT_PUBLIC_COLYSEUS_URL!
                );

                const joinedRoom = await client.joinOrCreate("my_room");

                room = joinedRoom;
                connecting = false;

                setStatus("connected");
                setRoomId(joinedRoom.roomId);
                setSessionId(joinedRoom.sessionId);

                // Listen for complete state changes
                joinedRoom.onStateChange((state) => {
                    setGameState(state);
                });

                // Listen for players being added/removed/changed
                const callbacks = Callbacks.get(joinedRoom);

               

                callbacks.onRemove("players", (player, key) => {
                    console.log("Player removed:", key);

                    setPlayers((current) =>
                        current.filter((p) => p.key !== key)
                    );
                });

                // Test move
                joinedRoom.send("move", {
                    x: 10,
                    y: 20,
                });

                joinedRoom.onLeave(() => {
                    room = null;
                    connecting = false;
                    setStatus("disconnected");
                });
            } catch (error) {
                connecting = false;
                console.error("Colyseus connection failed:", error);
                setStatus("error");
            }
        }

        connect();

        return () => {
            if (room) {
                room.leave();
                room = null;
            }

            connecting = false;
        };
    }, []);

    return {
        status,
        roomId,
        sessionId,
        gameState,
        players,
    };
}