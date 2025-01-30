"use client";

import { useState } from "react";
import {io} from "socket.io-client";
import { useRouter } from "next/navigation";
import {encryptData} from '@utils/crypto'

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const socket = io("http://localhost:3001");

  const handleCreateRoom = async () => {
    try {
      socket.emit("createRoom", (roomId: string) => {
        const data = {
          roomId,
        }

        const code = encryptData(data)

        router.push(`/chat/${code}`)

      });
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Chat App</h1>
        <button
          onClick={handleCreateRoom}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg mb-4"
        >
          Create Room
        </button>
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="border px-4 py-2 rounded-lg mr-2"
          />
        </div>
      </div>
    </div>
  );
}
