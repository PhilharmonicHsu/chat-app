"use client";

import {io} from "socket.io-client";
import { useRouter } from "next/navigation";
import {encryptData} from '@utils/crypto';
import Introduction from "@components/HomePage/Introduction";
import DynamicBackground from "@components/HomePage/DynamicBackground";
import Footer from "@components/Common/Footer";

export default function HomePage() {
  const router = useRouter();
  const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001");
  const handleCreateRoom = () => {
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
    <>
      <div className="relative h-[calc(100vh-80px)] flex justify-center items-center bg-gradient-to-b from-[#5A5A5A] to-[#836953]">
        <DynamicBackground />
        <Introduction handleCreateRoom={handleCreateRoom} />
      </div>
      <Footer />
    </>
  );
}
