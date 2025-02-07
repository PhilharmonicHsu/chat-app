'use client'

import React, { useEffect, useState, useRef, useContext } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { ChatContext } from "@context/ChatContextProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ConnectionState, Mode } from '@/enums'
import Button from '@components/Common/Button';
import VideoController from '@components/Common/VideoController'

AgoraRTC.setLogLevel(2); // close all of the logs

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

export default function VideoCallRoom() {
    const chatCtx = useContext(ChatContext);

    const localAudioTrackRef = useRef(null);
    const localVideoTrackRef = useRef(null);
    const selfScreenRef = useRef(null);
    const smallScreenRef = useRef(null);
    
    const [isSmallSize, setIsSmallSize] = useState(false);  
    const CHANNEL_NAME = `${chatCtx.roomId}-${chatCtx.nickname}-preparing-channel`;
  
    useEffect(() => {
      const joinChannel = async () => {
        if (client.connectionState !== ConnectionState.DISCONNECTED) {
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
    }, [CHANNEL_NAME]);

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

      chatCtx.toggleMode(Mode.MEETING)
    };
  
    return (
      <div className="flex h-screen font-sans">
        {/* 左側：房間資訊 */}
        <aside className="w-full lg:w-1/4 bg-gradient-to-b from-[#5A5A5A] to-[#836953] text-white p-6 flex flex-col gap-6 shadow-xl">
          <h2 className="text-3xl font-semibold mb-6 text-center font-exo">
            Preparing
          </h2>
          <Button
            color="blue"
            onClick={prepared}
          >
            Prepared & Join Room
          </Button>
  
          <Button
            color="brown"
            onClick={() => chatCtx.toggleMode(Mode.CHAT)}
          >
            Back to Chat
          </Button>
          <div className={ isSmallSize 
            ? "flex-1 w-full bg-stone-400 flex items-center justify-center shadow-inner rounded-lg"
            : "hidden flex-1 w-full bg-stone-400 flex items-center justify-center shadow-inner rounded-lg"
          }>
              <div
                  className="rounded-lg w-full h-full bg-black overflow-hidden"
                  ref={smallScreenRef}
              />
          </div>
          <VideoController localAudioTrackRef={localAudioTrackRef} localVideoTrackRef={localVideoTrackRef} />
        </aside>
  
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
  