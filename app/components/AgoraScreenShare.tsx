"use client";

import { useState, useEffect } from "react";
import AgoraRTC, { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!; // 替換為你的 Agora App ID
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export default function AgoraScreenShare() {
  const [joined, setJoined] = useState(false);
  const [screenTrack, setScreenTrack] = useState<any>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [channelName, setChannelName] = useState("");

  const joinRoom = async () => {
    try {
      const uid = await client.join(appId, channelName, null);
      console.log(`Joined channel: ${channelName} with UID: ${uid}`);
      setJoined(true);

      // 訂閱其他用戶的流
      client.on("user-published", async (user, mediaType) => {
        console.log(`User published: ${user.uid}, mediaType: ${mediaType}`);

        try {
          await client.subscribe(user, mediaType);
          console.log(`Subscribed to ${user.uid}`);

          if (mediaType === "video") {
            setRemoteUsers((prevUsers) => [...prevUsers, user]); // 更新用戶列表
          }
        } catch (error) {
          console.error(`Failed to subscribe to ${user.uid}`, error);
        }
      });

      // 處理用戶離開
      client.on("user-unpublished", (user) => {
        console.log(`User unpublished: ${user.uid}`);
        setRemoteUsers((prevUsers) =>
          prevUsers.filter((u) => u.uid !== user.uid)
        );
      });
    } catch (error) {
      console.error("Failed to join channel:", error);
    }
  };

  // 當 remoteUsers 改變時，確保渲染完成後播放流
  useEffect(() => {
    remoteUsers.forEach((user) => {
      const containerId = `user-video-${user.uid}`;
      const container = document.getElementById(containerId);

      if (container && user.videoTrack) {
        user.videoTrack.play(containerId); // 播放流到對應的容器
        console.log(`Playing video track for user: ${user.uid}`);
      }
    });
  }, [remoteUsers]);

  const startScreenShare = async () => {
    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: "1080p_1",
      });

      setScreenTrack(screenTrack);

      // 發布螢幕共享流
      await client.publish([screenTrack]);
      console.log("Screen sharing started");

      screenTrack.on("track-ended", () => {
        stopScreenShare();
        console.log("Screen sharing ended");
      });
    } catch (error) {
      console.error("Failed to start screen sharing:", error);
    }
  };

  const stopScreenShare = async () => {
    if (screenTrack) {
      await client.unpublish([screenTrack]);
      screenTrack.stop();
      setScreenTrack(null);
      console.log("Screen sharing stopped");
    }
  };

  return (
    <div>
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter Channel Name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <button onClick={startScreenShare}>Start Screen Share</button>
          <button onClick={stopScreenShare}>Stop Screen Share</button>
        </div>
      )}

      {/* 顯示其他用戶的螢幕流 */}
      <div>
        {remoteUsers.map((user) => (
          <div key={user.uid}>
            <p>Remote User: {user.uid}</p>
            <div
              id={`user-video-${user.uid}`}
              style={{ width: "400px", height: "300px", background: "black" }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
