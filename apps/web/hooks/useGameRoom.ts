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
        let mounted = true;

        async function connect() {
            // Already connected
            if (room) {
                if (mounted) {
                    setStatus("connected");
                    setRoomId(room.roomId);
                    setSessionId(room.sessionId);
                }
                return;
            }

            // Another connection is already being established
            if (connecting) {
                return;
            }

            connecting = true;

            try {
                const client = new Client(
                    process.env.NEXT_PUBLIC_COLYSEUS_URL!
                );

                const joinedRoom = await client.joinById("demo-room");

                // Effect was cleaned up while connection was being established
                if (!mounted) {
                    await joinedRoom.leave();
                    connecting = false;
                    return;
                }

                room = joinedRoom;
                connecting = false;

                setStatus("connected");
                setRoomId(joinedRoom.roomId);
                setSessionId(joinedRoom.sessionId);

                // Listen for synchronized state changes
                joinedRoom.onStateChange((state) => {
                    console.log("Game state:", state);

                    if (!mounted) return;

                    setGameState(state);

                    const playerList: any[] = [];

                    state.players.forEach(
                        (player: any, key: string) => {
                            playerList.push({
                                key,
                                sessionId: key,
                                lettersTyped: player.lettersTyped,
                                text: player.text,
                            });
                        }
                    );

                    setPlayers(playerList);
                });

                // Listen for players being removed
                const callbacks = Callbacks.get(joinedRoom);

                callbacks.onRemove(
                    "players",
                    (player, key) => {
                        console.log("Player removed:", key);

                        if (!mounted) return;

                        setPlayers((current) =>
                            current.filter((p) => p.key !== key)
                        );
                    }
                );

                // Listen for the room being left
                joinedRoom.onLeave(() => {
                    if (room === joinedRoom) {
                        room = null;
                    }

                    connecting = false;

                    if (mounted) {
                        setStatus("disconnected");
                    }
                });

            } catch (error) {
                connecting = false;

                console.error(
                    "Colyseus connection failed:",
                    error
                );

                if (mounted) {
                    setStatus("error");
                }
            }
        }

        connect();

        return () => {
            mounted = false;
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