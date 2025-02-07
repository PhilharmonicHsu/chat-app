import { 
    IAgoraRTCClient as IAgoraClient, 
    IRemoteVideoTrack as RemoteVideoTrack,
    ICameraVideoTrack as CameraVIdeoTrack,
    IRemoteAudioTrack as RemoteAudioTrack
} from "agora-rtc-sdk-ng";

export type IAgoraRTCClient = IAgoraClient;

export type IRemoteVideoTrack = RemoteVideoTrack;

export type ICameraVideoTrack = CameraVIdeoTrack;

export type IRemoteAudioTrack = RemoteAudioTrack;

export type IAgoraRTCRemoteUser = {
    uid: string | number;
    videoTrack?: IRemoteVideoTrack | null;
    audioTrack?: RemoteAudioTrack | null
}