"use client";

import { useEffect, useRef, useState } from "react";
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

export default function VideoChat() {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [joined, setJoined] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [ddChannelName, setddChannelName] = useState<string>("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // const channelName = "test-channel"; // 測試用的頻道名稱
  const tempToken = null; // 如果啟用了 App Certificate，這裡需要提供動態 Token

  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setClient(agoraClient);

    return () => {
      agoraClient.leave();
    };
  }, []);

  const joinChannel = async () => {
    if (!client) return;

    // 加入頻道
    // await client.join(appId, channelName, tempToken, null);
    await client.join(appId, ddChannelName, tempToken, null);

    // 創建本地音視頻流
    const videoTrack = await AgoraRTC.createCameraVideoTrack();
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    setLocalVideoTrack(videoTrack);

    // 播放本地視訊
    if (localVideoRef.current) {
      videoTrack.play(localVideoRef.current);
    }

    // 發布本地音視頻流
    await client.publish([audioTrack, videoTrack]);
    setJoined(true);

    // 訂閱遠端用戶
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video" && remoteVideoRefs.current) {
        const remoteVideo = document.createElement("video");
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;
        document.getElementById("remote-videos")?.appendChild(remoteVideo);
        user.videoTrack?.play(remoteVideo);
      }
    });

    // 監聽遠端用戶離開
    client.on("user-unpublished", (user) => {
      setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    });
  };

  const leaveChannel = async () => {
    if (!client) return;

    await client.leave();
    localVideoTrack?.close();
    setJoined(false);
  };

  return (
    <div>
      <h1>Agora Video Chat</h1>

      <input type="text"
             value={ddChannelName}
             onChange={(e) => setddChannelName(e.target.value)}
      />

      {!joined ? (
        <button onClick={joinChannel}>Join Channel</button>
      ) : (
        <button onClick={leaveChannel}>Leave Channel</button>
      )}

      <div>
        <h2>Local Video</h2>
        <video ref={localVideoRef} autoPlay playsInline></video>
      </div>

      <div>
        <h2>Remote Videos</h2>
        <div id="remote-videos"></div>
      </div>
    </div>
  );
}
