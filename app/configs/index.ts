
const publicWebSocketUrl: string = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001"

const publicAgoraAppId :string = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export default {
    publicWebSocketUrl,
    publicAgoraAppId
}