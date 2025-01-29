import { useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function CreateRoom() {
  const [roomId, setRoomId] = useState("");

  const handleCreateRoom = () => {
    socket.emit("createRoom", (id: string) => {
      setRoomId(id);
      console.log(`Room created: ${id}`);
    });
  };

  return (
    <div>
      <button onClick={handleCreateRoom}>Create Room</button>
      {roomId && <p>Room ID: {roomId}</p>}
    </div>
  );
}
