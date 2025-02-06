'use client'

import React, { useEffect, useState, useRef, useContext } from "react";
import Sidebar from '@components/Sidebar'
import Button from '@components/Button'
import {AudioIcon, AudioOffIcon, VideoIcon, VideoOffIcon} from '@components/icons'
import { MdOutlineFitScreen } from "react-icons/md";
import { FaDoorOpen } from "react-icons/fa6";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import './screen-share.scss'
import AgoraRTC, { IAgoraRTCClient, IRemoteVideoTrack } from "agora-rtc-sdk-ng";
import { ChatContext } from "@context/ChatContextProvider";

AgoraRTC.setLogLevel(2); // close all of the logs

const SCREEN_SHARE_UID = 1;

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

interface IAgoraRTCRemoteUser {
    uid: string | number;
    videoTrack?: IRemoteVideoTrack | null;
  }

export default function VideoCallRoom() {
    console.log('VideoCallRoom')
    const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!; // 替換為你的 Agora App ID

    const chatCtx = useContext(ChatContext);
    const CHANNEL_NAME = chatCtx.roomId; 

    const localAudioTrackRef = useRef(null);
    const localVideoTrackRef = useRef(null);
    const selfScreenRef = useRef(null);
    const sharingScreenRef = useRef(null);
    const localScreenShareTrackRef = useRef(null)

    const [screenClient, setScreenClient] = useState<IAgoraRTCClient | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [isSharingScreen, setIsSharingScreen] = useState(false);

    const handle = useFullScreenHandle();

    useEffect(() => {
        const joinChannel = async () => {
            if (client.connectionState !== "DISCONNECTED") {
                return;
            }
    
            await client.join(APP_ID, CHANNEL_NAME, null, null);
            
            const tracks = [];
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack(); // create audio stream
            localAudioTrackRef.current = audioTrack;
            tracks.push(audioTrack)
            
            const videoTrack = await AgoraRTC.createCameraVideoTrack(); // create video stream
            localVideoTrackRef.current = videoTrack
            tracks.push(videoTrack)
    
            await client.publish(tracks);
        
            if (selfScreenRef.current) {
                videoTrack?.play(selfScreenRef.current)
            }
    
            await videoTrack.setEnabled(chatCtx.isVideoEnabled);
            await audioTrack.setEnabled(chatCtx.isAudioEnabled);
    
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
                            user.videoTrack?.stop();
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
    
            client.on("user-left", (user) => { 
                setRemoteUsers(prev => prev.filter(remoteUser => remoteUser.uid !== user.uid));
            });
    
            // Subscribe to the videos of users who already exist in this channel
            for (const user of client.remoteUsers) {
                await client.subscribe(user, "video"); // subscribe video stream
                await client.subscribe(user, "audio"); // subscribe audio stream
    
                setRemoteUsers((prev) => [
                    ...prev, 
                    { uid: user.uid, videoTrack: user.videoTrack, audioTrack: user.audioTrack }
                ]);
            }
    
            const screenSharinigUser = client.remoteUsers.find(user => user.uid === SCREEN_SHARE_UID);
    
            if (screenSharinigUser) {
                await client.subscribe(screenSharinigUser, "video"); // subscribe video stream
    
                if (sharingScreenRef.current) {
                    screenSharinigUser.videoTrack?.play(sharingScreenRef.current)
                }
            }
        };

        joinChannel()
    }, [APP_ID, CHANNEL_NAME, chatCtx.isAudioEnabled, chatCtx.isVideoEnabled]);

    

    const leavingChannel = async () => {
        localAudioTrackRef.current?.close();
        localVideoTrackRef.current?.close();
        client.leave();
        chatCtx.toggleMode("chat")
    }

    const toggleVideo = async () => {
        if (localVideoTrackRef.current) {
            await localVideoTrackRef.current.setEnabled(! chatCtx.isVideoEnabled);
            chatCtx.toggleIsVideoEnabled(! chatCtx.isVideoEnabled);
        }
    }

    const toggleAudio = async () => {
        if (localAudioTrackRef.current) {
            await localAudioTrackRef.current.setEnabled(! chatCtx.isAudioEnabled);
            chatCtx.toggleIsAudioEnabled(! chatCtx.isAudioEnabled);
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

        localScreenShareTrackRef.current = screenTrack;

        setScreenClient(screenClient);
        setIsSharingScreen(true);      
    } else {        
        await client.unpublish(localScreenShareTrackRef.current);
        localScreenShareTrackRef.current?.close();

        screenClient?.leave();
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
            <ul>
                {remoteUsers.map((user) => (
                    <li key={user.uid}>用戶 {user.uid}</li>
                ))}
            </ul>
            <div className="flex flex-col gap-4">
                <Button 
                    color="red"
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
                    {isSharingScreen ? "Stop sharing" : "Share screen"}
                </Button>

                <div className="bg-white bg-opacity-10 p-4 rounded-lg shadow-lg">
                    <h3 className="text-center font-bold text-lg mb-4">Setting Up</h3>
                    <div className="flex gap-4 justify-center">
                        <Button
                            color="white"
                            onClick={toggleVideo}
                        >
                            {chatCtx.isVideoEnabled ? <VideoIcon /> : <VideoOffIcon />}
                        </Button>
                        <Button
                            color="white"
                            onClick={toggleAudio}
                        >
                            {chatCtx.isAudioEnabled ? <AudioIcon /> : <AudioOffIcon />}
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
