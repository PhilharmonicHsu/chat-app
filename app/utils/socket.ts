import { io } from 'socket.io-client';
const socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
    transports: ["websocket"], // 明確僅使用 WebSocket
  }); // 後端地址
export default socket;
