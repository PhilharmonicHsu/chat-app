'use client';

import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import VideoCallRoom from "@components/VideoCallRoom";
import VideoPreparingRoom from "@components/VideoPreparingRoom";
import Sidebar from '@components/Common/Sidebar'
import Button from '@components/Common/Button'
import DisplayArea from "@components/ChatRoom/DisplayArea";
import InputArea from "@components/ChatRoom/InputArea";
import { ChatContext } from "@context/ChatContextProvider";
import { encryptData, decryptData } from "@utils/crypto";
import { Mode } from '@/enums'
import { io } from "socket.io-client";
import { FaHome } from "react-icons/fa";
import { IoVideocamOutline, IoCopyOutline } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '@/configs'
import useDeviceCheck from "@/hooks/useDeviceCheck";

const socket = io(config.publicWebSocketUrl, {
  transports: ["websocket"],
});

export default function ChatRoom() {
  useDeviceCheck();

  const router = useRouter();
  const [messages, setMessages] = useState<{ type: "text" | "image", nickname: string, content: string }[]>([]);
  const [inviteLink, setInviteLink] = useState("");
  const { encrypted } = useParams();
  const decrypted = decryptData(encrypted);
  const chatCtx = useContext(ChatContext);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (!decrypted.roomId || !decrypted.nickname) {
      alert("Invalid room data");
      router.push("/");

      return;
    }

    chatCtx.toggleRoomId(decrypted.roomId)
    chatCtx.toggleNickname(decrypted.nickname)
    setInviteLink(encryptData({roomId: decrypted.roomId}))

    socket.emit("joinRoom", decrypted.roomId, "Anonymous", (response) => {
      if (response.error) {
        console.error(response.error);
      }
    });
  }, [chatCtx, decrypted.roomId, decrypted.nickname, router]);

  useEffect(() => {
    socket.on("message", (pack) => {
      // 僅提示來自其他用戶的訊息
      if (pack.nickname !== chatCtx.nickname) {
        setMessages(prev => [...prev, { nickname: pack.nickname, type: pack.type, content: pack.message }]);

        new Notification("New Message", {
          body: pack.message,
        });
      }
    });

    return () => {
      socket.off("message");
      socket.emit("leaveRoom", chatCtx.roomId);
    };
  }, [chatCtx.roomId, chatCtx.nickname]);

  // 按鈕點擊後複製連結
  const handleCopyLink = () => {
    const link = `${window.location.protocol}//${window.location.host}/chat/${inviteLink}`;

    navigator.clipboard.writeText(link).then(() => {
      toast.success("Copied!", {
        position: 'top-center',
      });
    });
  };

  const handleStartMeeting = () => {
    chatCtx.toggleMode("preparing")
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  if (chatCtx.mode === Mode.CHAT) {
    return (
      <div className="flex h-screen">
        <Sidebar>
          <p className="mt-2">Nickname: {chatCtx.nickname}</p>
          <Button 
            color="blue"
            onClick={handleCopyLink}
          >
            <IoCopyOutline className="w-5 h-5" />
            Copy Invite Link
          </Button>
          <Button 
            color="brown"
            onClick={handleStartMeeting}
          >
            <IoVideocamOutline className="w-6 h-6" />
            Start Meeting
          </Button>
          <Button 
            color="green"
            onClick={handleBackToHome}
          >
            <FaHome className="w-6 h-6" />
            Home
          </Button>
        </Sidebar>
  
        <div className="w-full flex flex-col ml-20">
          <DisplayArea messages={messages} />
          <InputArea 
            socket={socket} 
            setMessages={setMessages}
          />
        </div>
        <ToastContainer autoClose={3000} />
      </div>
    );
  }
  
  if (chatCtx.mode === Mode.PREPARING) {
    return <VideoPreparingRoom />
  }

  if (chatCtx.mode === Mode.MEETING) {
    return <VideoCallRoom />
  }
}
