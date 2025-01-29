"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function ChatRoom({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.emit("joinRoom", roomId, "Anonymous", (response: any) => {
      if (response.error) {
        console.error(response.error);
      }
    });

    socket.on("message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
      socket.emit("leaveRoom", roomId);
    };
  }, [roomId]);

  const sendMessage = () => {
    socket.emit("message", roomId, message);
    setMessage("");
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
