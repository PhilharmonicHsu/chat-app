'use client'

import React, { useEffect, useState, useRef, useContext } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { ChatContext } from "app/context/ChatContextProvider";
import SoundIcon from "./icons/SoundIcon";
import SoundOffIcon from "./icons/SoundOffIcon"
import VideoIcon from "./icons/VideoIcon";
import VideoOffIcon from "./icons/VideoOffIcon";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

export default function VideoCallRoom() {
    const chatCtx = useContext(ChatContext);

    const localAudioTrackRef = useRef<any>(null);
    const localVideoTrackRef = useRef<any>(null);
    const selfScreenRef = useRef(null);
    const smallScreenRef = useRef(null);
    
    const [isSmallSize, setIsSmallSize] = useState(false);  
    const CHANNEL_NAME = `${chatCtx.roomId}-${chatCtx.nickname}-preparing-channel`;
  
    useEffect(() => {
      const joinChannel = async () => {
        if (client.connectionState !== "DISCONNECTED") {
          return 
        }
        
        await client.join(APP_ID, CHANNEL_NAME, null, null);

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
  
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
  
        buildVideo(window.innerWidth)
      };
  
      joinChannel();
    }, []);

    const buildVideo = (screenWidth: number) => {
      if (screenWidth < 1024) {
        if (smallScreenRef.current) {
          localVideoTrackRef.current?.play(smallScreenRef.current);
        }
        setIsSmallSize(true);
    } else {
        if (selfScreenRef.current) {
          localVideoTrackRef.current?.play(selfScreenRef.current);
        }
        setIsSmallSize(false);
    }
    }

    useEffect(() => {
        window.addEventListener("orientationchange", () => buildVideo(window.innerHeight));

        return () => {
          window.removeEventListener('orientationchange', () => buildVideo(window.innerHeight));
        };
    }, []) 

    const prepared = async () => {
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      client.leave();

      chatCtx.toggleMode("meeting")
    };
  
    const toggleSound = async () => {
      await localAudioTrackRef.current.setEnabled(!chatCtx.isAudioEnabled);
      chatCtx.toggleIsAudioEnabled(! chatCtx.isAudioEnabled)
      toast.success(`Audio ${chatCtx.isAudioEnabled ? 'Muted' : 'Unmuted'}`, {
        position: 'top-center',
      });
    };
  
    const toggleVideo = async () => {
      await localVideoTrackRef.current.setEnabled(!chatCtx.isVideoEnabled);
      chatCtx.toggleIsVideoEnabled(! chatCtx.isVideoEnabled)
      toast.success(`Video ${chatCtx.isVideoEnabled ? 'Stopped' : 'Started'}`, {
        position: 'top-center',
      });
    };
  
    return (
      <div className="flex h-screen font-sans">
        {/* 左側：房間資訊 */}
        <div className="w-full lg:w-1/4 bg-gradient-to-b from-[#5A5A5A] to-[#836953] text-white p-6 flex flex-col gap-6 shadow-xl">
          <h2 className="text-3xl font-semibold mb-6 text-center font-exo">
            Preparing
        </h2>
          <button
            className="bg-gradient-to-r from-[#6B93D6] to-[#375A96] px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-md hover:shadow-xl hover:scale-105 transform transition"
            onClick={prepared}
          >
            Prepared & Join Room
          </button>
  
          <button
            className="bg-gradient-to-r from-[#9A7957] to-[#6C553B] px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-md hover:shadow-xl hover:scale-105 transform transition"
            onClick={() => chatCtx.toggleMode("chat")}
          >
            Back to Chat
          </button>
          <div className={ isSmallSize 
            ? "flex-1 w-full bg-stone-400 flex items-center justify-center shadow-inner rounded-lg"
            : "hidden flex-1 w-full bg-stone-400 flex items-center justify-center shadow-inner rounded-lg"
          }>
              <div
                  className="rounded-lg w-full h-full bg-black overflow-hidden"
                  ref={smallScreenRef}
              />
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-lg shadow-lg">
            <h3 className="text-center font-bold text-lg mb-4">Setting Up</h3>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-white p-4 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition"
                onClick={toggleSound}
              >
                {chatCtx.isAudioEnabled ? <SoundIcon /> : <SoundOffIcon />}
              </button>
              <button
                className="bg-white p-4 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition"
                onClick={toggleVideo}
              >
                {chatCtx.isVideoEnabled ? <VideoIcon /> : <VideoOffIcon />}
              </button>
            </div>
          </div>
        </div>
  
        {/* 右側：視訊畫面 */}
        <div className={isSmallSize
          ? "hidden flex-1 w-full lg:w-3/4 bg-stone-400 flex items-center justify-center shadow-inner" 
          : "flex-1 w-full lg:w-3/4 bg-stone-400 flex items-center justify-center shadow-inner"
        }>
          <div
            className="rounded-lg w-3/4 h-3/4 bg-black overflow-hidden"
            ref={selfScreenRef}
          />
        </div>
        <ToastContainer autoClose={3000} />
      </div>
    );
  }
  