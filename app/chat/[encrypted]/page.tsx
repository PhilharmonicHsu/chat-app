'use client'

import ChatRoom from "@components/ChatRoom";
import { useParams } from "next/navigation";
import {decryptData} from "@utils/crypto";
import { useState, useEffect } from "react";
import ChatContextProvider from '@context/ChatContextProvider'
import Lobby from "@components/Lobby";

export default function RoomPage() {
  const { encrypted } = useParams()
  const [roomId, setRoomId] = useState<string>("");

  const decrypted: {roomId: string, nickname?: string} = decryptData(encrypted);

  useEffect(() => {
    setRoomId(decrypted.roomId);
  }, [])

  if (! decrypted.nickname) {
    return <Lobby roomId={roomId} />;
  }

  return (
    <ChatContextProvider>
      <ChatRoom/>
    </ChatContextProvider>
  );
}
