import express, { Express } from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 當前房間列表（可用資料庫替代）
const rooms: Record<string, string[]> = {};

// Socket.IO 配置
io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  // 創建房間
  socket.on("createRoom", (callback) => {
    const roomId = Math.random().toString(36).substring(2, 10); // 隨機生成房間 ID
    rooms[roomId] = []; // 初始化房間
    console.log(`Room created: ${roomId}`);
    callback(roomId); // 返回房間 ID
  });

  // 加入房間
  socket.on("joinRoom", (roomId, nickname, callback) => {
    if (!rooms[roomId]) {
      return callback({ error: "Room does not exist" });
    }

    socket.join(roomId); // 加入房間
    rooms[roomId].push(nickname); // 添加到房間用戶列表
    console.log(`${nickname} joined room: ${roomId}`);

    // 通知房間內其他用戶
    socket.to(roomId).emit("userJoined", `${nickname} joined the room`);

    callback({ success: true });
  });

  // 發送消息
  socket.on("message", (roomId, message) => {
    console.log(`Message in room ${roomId}: ${message}`);
    io.to(roomId).emit("message", message); // 僅發送給該房間用戶
  });

  // 斷開連接
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // 可在此處處理用戶從房間中移除的邏輯
  });
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
