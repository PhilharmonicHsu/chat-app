"use client";

import {io} from "socket.io-client";
import { useRouter } from "next/navigation";
import {encryptData} from '@utils/crypto'
import Button from '@components/Button'

export default function HomePage() {
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
    <div className="h-screen flex justify-center items-center bg-gradient-to-b from-[#5A5A5A] to-[#836953]">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Green Island</h1>
        <div className="flex justify-center items-center">
          <Button
            color="blue"
            onClick={handleCreateRoom}
          >
            Create Room
          </Button>
        </div>
      </div>
    </div>
  );
}
