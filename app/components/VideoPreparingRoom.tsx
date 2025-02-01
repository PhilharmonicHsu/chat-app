'use client'

import React, { useEffect, useState, useRef, useContext } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useRouter } from "next/navigation";
import { ChatContext } from "app/context/ChatContextProvider";
import SoundIcon from "./icons/SoundIcon";
import SoundOffIcon from "./icons/SoundOffIcon"
import VideoIcon from "./icons/videoIcon";
import VideoOffIcon from "./icons/VideoOffIcon";



AgoraRTC.setLogLevel(2); // 關閉所有日誌

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });


/**
 * todo: 
 * 1. 增加準備進入視訊通話的畫面
 * 2. 建立 Context 控制狀態，儲存返回聊天室的URL - done
 * 3. 開啟分享螢幕模式之後，頻道內視訊列表會重新排列
 * 4. 每個 video tag 應該都要可以有放大到全螢幕的效果
 * 5. 實作離開頻道與結束螢幕分享的邏輯
 */
export default function VideoCallRoom({roomId}: {roomId: string}) {
    const chatCtx = useContext(ChatContext);

    const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
    const selfScreenRef = useRef(null);

    const [isAudioEnable, setIsAudioEnable] = useState(true);
    const [isVideoEnable, setIsVideoEnable] = useState(true);

    const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!; // 替換為你的 Agora App ID
    const CHANNEL_NAME = `${roomId}-${chatCtx.nickname}-preparing-channel`; 

    useEffect(() => {
        const joinChannel = async () => {
            // 加入頻道
                const uid = await client.join(APP_ID, CHANNEL_NAME, null, null);
                
                console.log("成功加入頻道，UID 為：", uid);
        
                const tracks = [];
                const audioTrack = await AgoraRTC.createMicrophoneAudioTrack(); // 創建音頻
                setLocalAudioTrack(audioTrack);
                tracks.push(audioTrack)
                
                const videoTrack = await AgoraRTC.createCameraVideoTrack(); // 創建視頻
                setLocalVideoTrack(videoTrack);
                tracks.push(videoTrack)
        
                await client.publish(tracks);
                
                if (selfScreenRef.current) {
                    videoTrack?.play(selfScreenRef.current)
                } else {
                    console.error("selfScreenRef.current is null");
                }
          };

          joinChannel()
    }, []);

    useEffect(() => {
        
    }, [isVideoEnable])

    const prepared = async () => {
        localAudioTrack?.close();
        localVideoTrack?.close();
        client.leave();
    }

    const toggleSound = async () => {
        await localAudioTrack.setEnabled(! isAudioEnable)
        setIsAudioEnable(! isAudioEnable);
    }

    const toggleVideo = async () => {
        await localVideoTrack.setEnabled(! isVideoEnable);
        setIsVideoEnable(! isVideoEnable);
    }

  return (
    <div className="flex h-screen">
      {/* 左側：房間資訊 */}
      <div className="w-1/8 bg-gray-800 text-white p-4 flex flex-col gap-4">
        <h2 className="text-lg font-bold mb-4">Preparing</h2>
        <div className="flex flex-col gap-4">
            <button
                className="bg-green-500 text-white px-4 py-2 rounded"
            >
                Prepared & Join Room 
            </button>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => chatCtx.toggleMode("chat")}
            >
                Back to Chat
            </button>
        </div>
        <div className="border border-solid border-white rounded-lg flex flex-col gap-4">
            <h2 className="text-center font-bold">Setting Up</h2>
            <button 
                className="bg-white p-4 rounded-md w-fit"
                onClick={toggleSound}
            >
                {isAudioEnable ? <SoundOffIcon /> : <SoundIcon />}
            </button>
            <button 
                className="bg-white p-4 rounded-md w-fit"
                onClick={toggleVideo}
            >
                {isVideoEnable ? <VideoIcon /> : <VideoOffIcon />}
            </button>
        </div>
      </div>

      {/* 右側：視訊畫面 */}
      <div className="flex-1 w-7/8 bg-gray-100 flex flex-col">
        {/* 主畫面 */}
        <div
            className="rounded-lg w-full h-full"
            ref={selfScreenRef}
        />
      </div>
    </div>
  );
}
