'use client'

import React, { useEffect, useState, useRef, useContext } from "react";
import Sidebar from '@components/Common/Sidebar'
import Button from '@components/Common/Button'
import { MdOutlineFitScreen } from "react-icons/md";
import { FaDoorOpen } from "react-icons/fa6";
import AgoraRTC from "agora-rtc-sdk-ng";
import { ChatContext } from "@context/ChatContextProvider";
import ShareScreen from '@components/VideoCallRoom/ShareScreen';
import UserVideoArea from '@components/VideoCallRoom/UserVideoArea';
import VideoController from "@components/Common/VideoController";
import {IAgoraRTCRemoteUser, IAgoraRTCClient} from '../types';
import GLOBAL_CONFIG from '@utils/globals'
import { ConnectionState, Mode } from '@enums/index'

AgoraRTC.setLogLevel(2); // close all of the logs

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export default function VideoCallRoom() {
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
    const [isSharingSelfScreen, setIsSharingSelfScreen] = useState(false);

    useEffect(() => {
        const joinChannel = async () => {
            if (client.connectionState !== ConnectionState.DISCONNECTED) {
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
                selfScreenRef.current.playSelfVideo(videoTrack)
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
    
                    if (user.uid === GLOBAL_CONFIG.SCREEN_SHARE_UID) {
                        setIsSharingScreen(true);  

                        if (sharingScreenRef.current) {
                            sharingScreenRef.current.playVideo(user.videoTrack);
                        }
                    } 
                } else {
                    setRemoteUsers(prev => {
                        const targetRemoteUser = prev.find(remoteUser => remoteUser.uid === user.uid);
                        if (targetRemoteUser) {
                            targetRemoteUser.audioTrack = user.audioTrack
    
                            return prev.map(remoteUser => remoteUser.uid === targetRemoteUser.uid 
                                ? targetRemoteUser
                                : remoteUser
                            )
                        } else {
                            return [
                                ...prev,
                                { uid: user.uid, videoTrack: null, audioTrack: user.audioTrack }
                            ]
                        }
                    })

                    user.audioTrack?.play();
                }
            });
    
            // 處理遠端用戶離開
            client.on("user-unpublished", (user, mediaType) => { 
                if (mediaType === "video") {
                    setRemoteUsers(prev => 
                        prev.map(remoteUser => remoteUser.uid === user.uid 
                            ? { ...remoteUser, videoTrack: null }
                            : remoteUser
                        )
                    );
    
                    if (user.uid === GLOBAL_CONFIG.SCREEN_SHARE_UID) {
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

                user.audioTrack?.play();
            }
    
            const screenSharinigUser = client.remoteUsers.find(user => user.uid === GLOBAL_CONFIG.SCREEN_SHARE_UID);
    
            if (screenSharinigUser) {
                await client.subscribe(screenSharinigUser, "video"); // subscribe video stream
    
                if (sharingScreenRef.current) {
                    sharingScreenRef.current.playVideo(screenSharinigUser.videoTrack)
                }
            }
        };

        joinChannel()
    }, [APP_ID, CHANNEL_NAME, chatCtx.isAudioEnabled, chatCtx.isVideoEnabled]);

    const leavingChannel = async () => {
        localAudioTrackRef.current?.close();
        localVideoTrackRef.current?.close();
        client.leave();
        chatCtx.toggleMode(Mode.CHAT)
    }

    const toggleScreenShare = async () => {
        if (!isSharingScreen) {
            const screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            await screenClient.join(APP_ID, CHANNEL_NAME, null, GLOBAL_CONFIG.SCREEN_SHARE_UID);

            const screenTrack = await AgoraRTC.createScreenVideoTrack({
                encoderConfig: "1080p_1",
            });

            await screenClient.publish(screenTrack);

            localScreenShareTrackRef.current = screenTrack;

            setIsSharingSelfScreen(true);
            setScreenClient(screenClient);
            setIsSharingScreen(true);      
        } else {        
            await client.unpublish(localScreenShareTrackRef.current);
            localScreenShareTrackRef.current?.close();

            screenClient?.leave();
            setIsSharingSelfScreen(false);
            setIsSharingScreen(false);
        }
    };

    return (
        <div className="relative flex w-full h-screen">
            <Sidebar>
                <ul>
                    {remoteUsers.map((user) => (
                        <li key={user.uid}>User {user.uid}</li>
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
                        disabled={isSharingScreen && !isSharingSelfScreen}
                    >
                        <MdOutlineFitScreen />
                        {isSharingScreen && isSharingSelfScreen ? "Stop sharing" : "Share screen"}
                    </Button>
                    <VideoController localAudioTrackRef={localAudioTrackRef} localVideoTrackRef={localVideoTrackRef} />
                </div>
            </Sidebar>

            {/* 右側：視訊畫面 */}
            <div className="pl-20 w-full h-screen bg-gray-100 flex flex-col">
                <ShareScreen ref={sharingScreenRef} isSharingScreen={isSharingScreen} />
                <UserVideoArea ref={selfScreenRef} remoteUsers={remoteUsers} isSharingScreen={isSharingScreen} />
            </div>
        </div>
    );
}
