'use client'

import React, { useEffect, useState, useRef, useContext } from "react";
import Sidebar from './Sidebar'
import Button from './Button'
import SoundIcon from "./icons/SoundIcon";
import SoundOffIcon from "./icons/SoundOffIcon"
import VideoIcon from "./icons/VideoIcon";
import VideoOffIcon from "./icons/VideoOffIcon";
import { MdOutlineFitScreen } from "react-icons/md";
import { FaDoorOpen } from "react-icons/fa6";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import './screen-share.scss'


import AgoraRTC from "agora-rtc-sdk-ng";
import { ChatContext } from "app/context/ChatContextProvider";

AgoraRTC.setLogLevel(2); // 關閉所有日誌

const SCREEN_SHARE_UID = 1;

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

/**
 * todo: 
 * 1. 增加準備進入視訊通話的畫面
 * 2. 建立 Context 控制狀態，儲存返回聊天室的URL - done
 * 3. 開啟分享螢幕模式之後，頻道內視訊列表會重新排列
 * 4. 每個 video tag 應該都要可以有放大到全螢幕的效果
 * 5. 實作離開頻道與結束螢幕分享的邏輯
 */
export default function VideoCallRoom() {
    const chatCtx = useContext(ChatContext);

    const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
    const [localScreenShareTrack, setLocalScreenShareTrack] = useState<any>(null)
    const [screenClient, setScreenClient] = useState<any>(null);
    const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const selfScreenRef = useRef(null);
    const sharingScreenRef = useRef(null);
    const [isAudioEnable, setIsAudioEnable] = useState(true);
    const [isVideoEnable, setIsVideoEnable] = useState(true);

    const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!; // 替換為你的 Agora App ID
    const CHANNEL_NAME = chatCtx.roomId; 

    const handle = useFullScreenHandle();

    useEffect(() => {
        joinChannel()
    }, []);

    const joinChannel = async () => {
    // 加入頻道
        const uid = await client.join(APP_ID, CHANNEL_NAME, null, null);
        
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
        }

        // 更新遠端用戶
        client.on("user-published", async (user, mediaType) => {                        
            await client.subscribe(user, mediaType);
            
            if (mediaType === 'video') {
                // before get videoTrack, we need to subscribe
                setRemoteUsers(prev => {
                    const targetRemoteUser = prev.find(remoteUser => remoteUser.uid === user.uid);
                    if (targetRemoteUser) {
                        targetRemoteUser.videoTrack = user.videoTrack

                        return prev.map(remoteUser => remoteUser.uid === targetRemoteUser.uid 
                            ? targetRemoteUser
                            : remoteUser
                        )
                    } else {
                        return [
                            ...prev,
                            { uid: user.uid, videoTrack: user.videoTrack, audioTrack: null}
                        ]
                    }
                })

                if (user.uid === SCREEN_SHARE_UID) {
                    setIsSharingScreen(true);  

                    if (sharingScreenRef.current) {
                        user.videoTrack?.play(sharingScreenRef.current)
                    }
                } 
            }
        });

        // 處理遠端用戶離開
        client.on("user-unpublished", (user, mediaType) => { 
            console.log('user-unpublished', user, mediaType)
            if (mediaType === "video") {
                setRemoteUsers(prev => 
                    prev.map(remoteUser => remoteUser.uid === user.uid 
                        ? { ...remoteUser, videoTrack: null }
                        : remoteUser
                    )
                );

                if (user.uid === SCREEN_SHARE_UID) {
                    setIsSharingScreen(false);  
    
                    if (sharingScreenRef.current) {
                        user.videoTrack?.close();
                    }
                } 
            } else {
                setRemoteUsers(prev => 
                    prev.map(remoteUser => remoteUser.uid === user.uid 
                        ? { ...remoteUser, audioTrack: null }
                        : remoteUser
                    )
                );
            }
        });

        client.on("user-left", (user, mediaType) => { 
            setRemoteUsers(prev => prev.filter(remoteUser => remoteUser.uid !== user.uid));
        });

        // 訂閱該頻道內已存在的用戶的視頻
        for (const user of client.remoteUsers) {
            await client.subscribe(user, "video"); // 訂閱視頻流
            await client.subscribe(user, "audio"); // 訂閱音頻流

            setRemoteUsers((prev) => [
                ...prev, 
                { uid: user.uid, videoTrack: user.videoTrack, audioTrack: user.audioTrack }
            ]);
        }

        const screenSharinigUser = client.remoteUsers.find(user => user.uid === SCREEN_SHARE_UID);
        if (screenSharinigUser) {
            await client.subscribe(screenSharinigUser, "video"); // 訂閱視頻流

            if (sharingScreenRef.current) {
                screenSharinigUser.videoTrack?.play(sharingScreenRef.current)
            }
        }
  };

    const leavingChannel = async () => {
        localAudioTrack?.close();
        localVideoTrack?.close();
        client.leave();
        chatCtx.toggleMode("chat")
    }

    const toggleVideo = async () => {
        if (localVideoTrack) {
            await localVideoTrack.setEnabled(! isVideoEnable);
            setIsVideoEnable(! isVideoEnable);
        }
    }

  const toggleScreenShare = async () => {
    if (!isSharingScreen) {
        const screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await screenClient.join(APP_ID, CHANNEL_NAME, null, SCREEN_SHARE_UID);

        const screenTrack = await AgoraRTC.createScreenVideoTrack({
            encoderConfig: "1080p_1",
        });

        await screenClient.publish(screenTrack);

        setLocalScreenShareTrack(screenTrack);
        setScreenClient(screenClient);
        setIsSharingScreen(true);      
    } else {        
        await client.unpublish(localScreenShareTrack);
        localScreenShareTrack?.close();

        screenClient.leave();
        setIsSharingScreen(false);
    }
  };

  const userVideoBarClasses = () => {
    const classes = ['bg-gray-800', 'gap-2', 'items-center', 'p-2'];

    if (isSharingScreen) {
        classes.push(...['h-auto', 'max-h-[200px]', 'w-auto', 'flex', 'overflow-x-scroll'])
    } else {
        const userAmount = [...remoteUsers].filter(user => user.uid !== SCREEN_SHARE_UID).length + 1; // plus self

        let cols = Math.floor(userAmount / 2);

        cols = cols < 2 ? 2 : cols;

        classes.push(...['flex-1', 'grid', `grid-cols-${cols}`, 'auto-rows-auto', 'overflow-y-auto'])
    }

    return classes.join(' ')
  }

  const userVideoClasses = () => {
    const classes = ['bg-gray-400', 'rounded-lg', 'overflow-hidden', 'aspect-video'];
    if (isSharingScreen) {
        classes.push(...['user-video', 'h-[200px]'])
    } else {
        classes.push(...['flex-1'])
    }

    return classes.join(' ');
  }

  return (
    <div className="relative flex w-full h-screen">
    <Sidebar>
        <h2 className="text-lg font-bold mb-4">房間資訊</h2>
        <ul>
          {remoteUsers.map((user) => (
            <li key={user.uid}>用戶 {user.uid}</li>
          ))}
        </ul>
        <div className="flex flex-col gap-4">
            <Button 
                color="blue"
                onClick={leavingChannel}
            >
                <FaDoorOpen />
                Leaving Room 
            </Button>
            <Button
                color="blue"
                onClick={toggleScreenShare}
            >
                <MdOutlineFitScreen />
                {isSharingScreen ? "Stop sharing" : "share screen"}
            </Button>

            <div className="bg-white bg-opacity-10 p-4 rounded-lg shadow-lg">
                <h3 className="text-center font-bold text-lg mb-4">Setting Up</h3>
                <div className="flex gap-4 justify-center">
                    <Button
                        color="white"
                        onClick={toggleVideo}
                    >
                        {isVideoEnable ? <VideoIcon /> : <VideoOffIcon />}
                    </Button>
                    <Button
                        color="white"
                        onClick={() => setIsAudioEnable(!isAudioEnable)}
                    >
                        {isAudioEnable ? <SoundIcon /> : <SoundOffIcon />}
                    </Button>
                </div>
            </div>
        </div>
    </Sidebar>

      {/* 右側：視訊畫面 */}
      <div className="pl-20 w-full h-screen bg-gray-100 flex flex-col">
        <FullScreen handle={handle} 
            className={ isSharingScreen 
                ? "flex-1 overflow-y-auto h-screen aspect-video flex" 
                : "flex-1 overflow-y-auto h-screen aspect-video flex hidden"
            } 
        >
            <div ref={sharingScreenRef} 
                 className="screen-share flex-1 aspect-video flex justify-center items-center w-full"
                 onClick={() => handle.enter()}
            />
        </FullScreen>
        
        <div className={userVideoBarClasses()}>
            {[...remoteUsers].filter(user => user.uid !== SCREEN_SHARE_UID).map(user => (
                <div
                key={user.uid}
                className={userVideoClasses()}
                ref={(el) => el && user.videoTrack?.play(el)}
                /> 
            ))}
            {/* 自己的畫面 */}
            <div
                className={userVideoClasses()}
                ref={selfScreenRef}
            />
        </div>
      </div>
    </div>
  );
}
