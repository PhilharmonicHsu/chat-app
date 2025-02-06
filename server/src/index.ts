import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import {PrismaClient} from '@prisma/client'

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: {
    origin: "https://green-island-client-fafa8eeb56ee.herokuapp.com", // 替換為你的前端域名
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true, // 如果需要帶上 Cookies 或其他憑證
  },
  transports: ["websocket"], // 強制只使用 WebSocket
});
const prisma = new PrismaClient()

// 當前房間列表（可用資料庫替代）
const rooms: Record<string, string[]> = {};

// Socket.IO 配置
io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  // 創建房間
  socket.on("createRoom", async (callback) => {
    const room = await prisma.room.create({
      data: {} // Prisma 自動生成 id 和 createdAt
    })
    const roomId = room.id

    rooms[roomId] = []; // 初始化房間
    callback(roomId); // 返回房間 ID
  });

  // 加入房間
  socket.on("joinRoom", (roomId, nickname, callback) => {
    if (!rooms[roomId]) {
      return callback({ error: "Room does not exist" });
    }

    socket.join(roomId); // 加入房間
    rooms[roomId].push(nickname); // 添加到房間用戶列表

    // 通知房間內其他用戶
    socket.to(roomId).emit("userJoined", `${nickname} joined the room`);

    callback({ success: true });
  });

  // 發送消息
  socket.on("message", (roomId, nickname, type, message) => {
    io.to(roomId).emit("message", {nickname, type, message}); // 僅發送給該房間用戶
  });

  // 斷開連接
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // 可在此處處理用戶從房間中移除的邏輯
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
