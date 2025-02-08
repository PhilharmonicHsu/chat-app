import { io } from 'socket.io-client';
import config from '@/configs'

const socket = io(config.publicWebSocketUrl, {
  transports: ["websocket"], // 明確僅使用 WebSocket
}); // 後端地址
export default socket;
