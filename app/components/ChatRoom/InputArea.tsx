import { GoImage } from "react-icons/go";
import { FiSend } from "react-icons/fi";
import { FaCode } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useState, useContext } from "react"
import { ChatContext } from "@context/ChatContextProvider";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";

export default function InputArea({socket, setMessages}) {
    const chatCtx = useContext(ChatContext);

    const [rows, setRows] = useState(1);
    const [message, setMessage] = useState("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
      
        // 計算換行數
        const lineBreaks = e.target.value.split("\n").length;
        setRows(lineBreaks < 5 ? lineBreaks : 5); // 最多 5 行，最少 1 行
    };

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

    const addCodeArea = () => {
        setMessage(prev => prev += "```plaintext\n\n```\n")
    
        const lineBreaks = message.split("\n").length += 3;

        setRows(lineBreaks < 5 ? lineBreaks : 5); // 最多 5 行，最少 1 行
    }

    const sendMessage = async() => {
        if (message.trim() !== "") {
          socket.emit("message", chatCtx.roomId, chatCtx.nickname, 'text', message);
          setMessages((prev) => [...prev, { type: "text", nickname: chatCtx.nickname, content: message }]);
          setMessage("");
        } 
    
        if (selectedImages.length !== 0) {
          selectedImages.forEach(async (acceptedFiles) => {
            const file = acceptedFiles;
            const formData = new FormData();
            formData.append("file", file);
    
            try {
              setMessages((prev) => [...prev, { type: "image", nickname: chatCtx.nickname, content: URL.createObjectURL(file) }]);
              
              const response = await axios.post("/api/upload", formData);
              const imageUrl = response.data.url;
              socket.emit("message", chatCtx.roomId, chatCtx.nickname, 'image', imageUrl);
            } catch (error) {
              console.error("Image upload failed", error);
            }
          })
          setSelectedImages([]);
        }
    };

    // 處理圖片上傳到 AWS S3
    const onDrop = async (acceptedFiles: File[]) => {
        setSelectedImages((prev) => [...prev, ...acceptedFiles]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {"image/*": []} });

    const removeImage = (index: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    }

    return <>
        <div className={selectedImages.length === 0 ? "flex gap-6 overflow-x-auto bg-gray-200" : "flex gap-6 overflow-x-auto p-6 bg-gray-200"}>
            {selectedImages.map((file, index) => (
                    <div key={index} className="relative w-24 h-24">
                    <Image
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        layout="fill"
                        objectFit="contain"
                        className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                    <button
                        className="absolute -top-4 -right-4 bg-white rounded-full p-1 text-red-500 shadow-md hover:bg-gray-200"
                        onClick={() => removeImage(index)}
                    >
                        <MdClose size={20} />
                    </button>
                    </div>
                ))}
        </div>
        <div className="p-4 bg-white border-t flex items-center">
            <textarea
                rows={rows}
                placeholder="Type message (Supports Markdown) & Type message (Shift + Enter to newline)"
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-grow border rounded px-4 py-2 mr-2 text-black"
            />

            <button {...getRootProps()} className="bg-blue-500 p-2 text-white rounded-lg mr-2">
                <input {...getInputProps()} />
                <GoImage size={20} />
            </button>

            <button onClick={addCodeArea} className="bg-blue-500 text-white p-2 rounded-lg mr-2">
                <FaCode size={20} />
            </button>

            {/* 發送按鈕 */}
            <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-lg mr-2">
                <FiSend size={20} />
            </button>
        </div>
    </>
}