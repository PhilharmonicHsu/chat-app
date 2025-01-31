"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { encryptData, decryptData } from "@utils/crypto";
import { FiSend, FiImage } from "react-icons/fi";
import { IoVideocamOutline, IoCopyOutline } from "react-icons/io5";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";
import VideoCallRoom from "./VideoCallRoom";
import VideoPreparingRoom from "./VideoPreparingRoom";
import { ChatContext } from "app/context/ChatContextProvider";

const socket = io("http://localhost:3001");

export default function ChatRoom() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<{ type: "text" | "image", nickname: string, content: string }[]>([]);
  const [message, setMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [rows, setRows] = useState(1);
  const { encrypted } = useParams();
  const decrypted = decryptData(encrypted);
  const chatCtx = useContext(ChatContext);

  useEffect(() => {
    // 確保用戶允許通知
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (!decrypted || !decrypted.roomId || !decrypted.nickname) {
      alert("Invalid room data");
      router.push("/");

      return;
    }

    setRoomId(decrypted.roomId);
    chatCtx.toggleNickname(decrypted.nickname)
    setInviteLink(encryptData({roomId: decrypted.roomId}))

    socket.emit("joinRoom", decrypted.roomId, "Anonymous", (response: any) => {
      if (response.error) {
        console.error(response.error);
      }
    });
  }, []);

  useEffect(() => {
    socket.on("message", (pack) => {
      setMessages(prev => [...prev, { nickname: pack.nickname, type: "text", content: pack.message }]);

      // 僅提示來自其他用戶的訊息
      if (pack.nickname !== chatCtx.nickname) {
        new Notification("New Message", {
          body: pack.message,
        });
      }
    });

    return () => {
      socket.off("message");
      socket.emit("leaveRoom", roomId);
    };
  }, [roomId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  
    // 計算換行數
    const lineBreaks = e.target.value.split("\n").length;
    setRows(lineBreaks < 5 ? lineBreaks : 5); // 最多 5 行，最少 1 行
  };

  // 文字輸入事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果 IME 正在組字，不送出
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      setRows(1);
    } else if (e.key === "Enter" && e.shiftKey) {
      // Shift + Enter 增加 textarea 高度
      setRows((prev) => (prev < 5 ? prev + 1 : prev));
    }
  };

  // 發送文字訊息（支援 Markdown）
  const sendMessage = () => {
    if (message.trim() === "") return;

    socket.emit("message", roomId, chatCtx.nickname, message);
    setMessage("");
  };

  // 按鈕點擊後複製連結
  const handleCopyLink = () => {
    const link = `${window.location.origin}/chat/${inviteLink}`;

    navigator.clipboard.writeText(link).then(() => {
      // setCopied(true);
      // setTimeout(() => setCopied(false), 2000); // 2 秒後自動隱藏「已複製」
    });
  };

  // 處理圖片上傳到 AWS S3
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/upload", formData);
      const imageUrl = response.data.url;
      setMessages((prev) => [...prev, { type: "image", nickname: chatCtx.nickname, content: imageUrl }]);
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: "image/*" });

  const renderers = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-200 px-2 py-1 rounded">{children}</code>
      );
    },
    p: ({ node, children, ...props }) => (
      <span className="text-black bg-white text-xl px-2 py-1 rounded-md border border-solid border-black" {...props}>
        {children}
      </span>
    ),
  };

  const handleStartMeeting = () => {
    chatCtx.toggleMode("meeting")
  }

  console.log(chatCtx.mode)

  if (chatCtx.mode === "chat") {
    return (
      <div className="flex h-screen">
        
        {/* 左側：房間資訊 */}
        <div className="w-1/4 bg-gray-800 text-white p-4 flex flex-col">
          <h2 className="text-lg font-bold">Room: {roomId}</h2>
          <p className="mt-2">Nickname: {chatCtx.nickname}</p>
          <button 
            className="mt-2 bg-white text-black px-1 py-2 rounded-md shadow-md font-bold hover:bg-gray-100 flex justify-center items-center gap-1"
            onClick={handleCopyLink}
          >
            <IoCopyOutline className="w-5 h-5" />
            Copy Invite Link
          </button>
          <button 
            className="mt-2 bg-white text-black px-1 py-2 rounded-md shadow-md font-bold hover:bg-gray-100 flex justify-center items-center gap-2"
            onClick={handleStartMeeting}
          >
            <IoVideocamOutline className="w-6 h-6" />
            Start Meeting
          </button>
        </div>
  
        {/* 右側：聊天內容 */}
        <div className="w-3/4 flex flex-col">
          {/* 訊息顯示區（支援 Markdown） */}
          <div className="text-black flex-grow bg-gray-100 p-4 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-2">
                {msg.type === "text" ? (
                  <>
                    {chatCtx.nickname !== msg.nickname ? <span>{msg.nickname} : </span> : <></>}
                    <ReactMarkdown
                      className={chatCtx.nickname === msg.nickname ? 'text-right' : ''}
                      remarkPlugins={[remarkGfm]}
                      components={renderers}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </>
                ) : (
                  <img src={msg.content} alt="uploaded" className="max-w-xs rounded-lg shadow-md" />
                )}
              </div>
            ))}
          </div>
  
          {/* 底部輸入區 */}
          <div className="p-4 bg-white border-t flex items-center">
            <textarea
              rows={rows}
              placeholder="Type message (Supports Markdown) & Type message (Shift + Enter to newline)"
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-grow border rounded px-4 py-2 mr-2 text-black"
            />
  
            {/* 圖片上傳區 */}
            <div {...getRootProps()} className="cursor-pointer p-2 bg-gray-300 rounded-lg mr-2">
              <input {...getInputProps()} />
              <FiImage size={20} />
            </div>
  
            {/* 發送按鈕 */}
            <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-lg mr-2">
              <FiSend size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (chatCtx.mode === "meeting") {
    return <VideoCallRoom roomId={roomId} />
  }

  if (chatCtx.mode === "preparing") {
    return <VideoPreparingRoom roomId={roomId} />
  }
}
