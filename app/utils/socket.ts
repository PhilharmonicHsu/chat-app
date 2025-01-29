import { io } from 'socket.io-client';
const socket = io('http://localhost:3001'); // 後端地址
export default socket;
