'use client'

import ChatRoom from "@components/ChatRoom";
import { useParams } from "next/navigation";
import {decryptData, encryptData} from "@utils/crypto";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatContextProvider from '../../context/ChatContextProvider'


export default function RoomPage() {
  const router = useRouter();
  const { encrypted } = useParams()
  const [nickname, setNickname] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const decrypted: {roomId: string, nickname?: string} = decryptData(encrypted);

  useEffect(() => {
    setRoomId(decrypted.roomId);
  }, [])


  const handleNicknameSubmit = () => {
    const data = {
      roomId,
      nickname
    }
    const code = encryptData(data)

    router.push(`/chat/${code}`)
  };

  if (! decrypted.nickname) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <div className="text-center bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Enter your Nickname</h2>
          <input
            type="text"
            placeholder="Your Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full mb-4"
          />
          <button
            onClick={handleNicknameSubmit}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            Enter Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatContextProvider>
      <ChatRoom/>
    </ChatContextProvider>
  );
}
