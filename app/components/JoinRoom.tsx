'use client'

import { useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoinRoom = () => {
    socket.emit("joinRoom", roomId, nickname, (response: any) => {
      if (response.error) {
        console.error(response.error);
      } else {
        setJoined(true);
        console.log(`Joined room: ${roomId}`);
      }
    });
  };

  return (
    <div>
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      ) : (
        <p>Welcome to room: {roomId}</p>
      )}
    </div>
  );
}
