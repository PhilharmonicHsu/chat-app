'use client'

import ChatRoom from "@components/ChatRoom";
import { useParams } from "next/navigation";


export default function RoomPage() {
  const { roomId } = useParams();

  if (!roomId) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome to Chat Room: {roomId}</h1>
      <ChatRoom roomId={roomId} />
    </div>
  );
}
