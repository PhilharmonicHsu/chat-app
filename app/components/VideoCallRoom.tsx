'use client'

import React, { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useRouter } from "next/navigation";

AgoraRTC.setLogLevel(2); // 關閉所有日誌

const SCREEN_SHARE_UID = 1;

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

/**
 * todo: 
 * 1. 增加準備進入視訊通話的畫面
 * 2. 建立 Context 控制狀態，儲存返回聊天室的URL
 * 3. 開啟分享螢幕模式之後，頻道內視訊列表會重新排列
 * 4. 每個 video tag 應該都要可以有放大到全螢幕的效果
 * 5. 實作離開頻道與結束螢幕分享的邏輯
 */
export default function VideoCallRoom({roomId}: {roomId: string}) {
    const router = useRouter();

    const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
    const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const selfScreenRef = useRef(null);
    const [isJoin, setIsJoin] = useState(false)

    const [isAudioEnable, setIsAudioEnable] = useState(true);
    const [isVideoEnable, setIsVideoEnable] = useState(true);

    const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!; // 替換為你的 Agora App ID
    const CHANNEL_NAME = roomId; 

    useEffect(() => {
    }, []);

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
        videoTrack?.play(selfScreenRef.current)

        // 更新遠端用戶
        client.on("user-published", async (user, mediaType) => {            
            if (mediaType === 'video') {
                // before get videoTrack, we need to subscribe
                await client.subscribe(user, mediaType);

                setRemoteUsers(prev => [...prev, { uid: user.uid, videoTrack: user.videoTrack }]);
            }
        });

        // 處理遠端用戶離開
        client.on("user-unpublished", (user, mediaType) => { 
            setRemoteUsers(prev => prev.filter(remoteUser => remoteUser.uid !== user.uid));
        });

        // 訂閱該頻道內已存在的用戶的視頻
        for (const user of client.remoteUsers) {
            await client.subscribe(user, "video"); // 訂閱視頻流
            await client.subscribe(user, "audio"); // 訂閱音頻流

            setRemoteUsers((prev) => [...prev, { uid: user.uid, videoTrack: user.videoTrack }]);
        }
  };

    const leavingChannel = async () => {
        localAudioTrack?.close();
        localVideoTrack?.close();
        client.leave();
    }

    const toggleVideo = async () => {
        console.log(localVideoTrack)
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
        console.log('published screenTrack')

        setIsSharingScreen(true);      
    } else {
        // 未完成
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        //   await client.unpublish(localVideoTrack);
        await client.publish(videoTrack);
        setLocalVideoTrack(videoTrack);
        setIsSharingScreen(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* 左側：房間資訊 */}
      <div className="w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold mb-4">房間資訊</h2>
        <ul>
          {remoteUsers.map((user) => (
            <li key={user.uid}>用戶 {user.uid}</li>
          ))}
        </ul>
        <div className="flex flex-col gap-4">

            {isJoin && (
                <>
                    <button className="mt-4 bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                        onClick={leavingChannel}
                    >
                        Leaving Room
                    </button>
                    <button
                        onClick={toggleVideo}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        {isVideoEnable ? 'Close Camora' : 'Open Camora'}
                    </button>
                    <button
                        onClick={() => setIsAudioEnable(!isAudioEnable)}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        {isAudioEnable ? 'Mute' : 'Unmute'} 
                    </button>
                    <button
                        onClick={toggleScreenShare}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        {isSharingScreen ? "Stop sharing" : "share screen"}
                    </button>
                </>
            )}

            {! isJoin && (<>
                <button
                    onClick={joinChannel}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Join Room 
                </button>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Back to Chat
                </button>
            </>)}
        </div>
      </div>

      {/* 右側：視訊畫面 */}
      <div className="w-3/4 bg-gray-100 flex flex-col">
        {/* 主畫面 */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 self-center">
            {remoteUsers.map(user => (
                <div
                  key={user.uid}
                  className={`bg-gray-400 rounded-lg w-[480px] h-[270px]`}
                  ref={(el) => el && user.videoTrack?.play(el)}
                />
            ))}
        </div>

        {/* 自己的畫面 */}
        <div className="h-32 bg-gray-700 flex items-center justify-center text-white">
          <div
            className="w-24 h-24 bg-gray-500 rounded-full"
            ref={selfScreenRef}
          />
        </div>
      </div>
    </div>
  );
}
