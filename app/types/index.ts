import { 
    IAgoraRTCClient as IAgoraClient, 
    IRemoteVideoTrack as RemoteVideoTrack,
    ICameraVideoTrack as CameraVIdeoTrack
} from "agora-rtc-sdk-ng";

export type IAgoraRTCClient = IAgoraClient;

export type IRemoteVideoTrack = RemoteVideoTrack;

export type ICameraVideoTrack = CameraVIdeoTrack;

export type IAgoraRTCRemoteUser = {
    uid: string | number;
    videoTrack?: IRemoteVideoTrack | null;
}