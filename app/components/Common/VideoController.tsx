import {useContext} from 'react';
import { ChatContext } from "@context/ChatContextProvider";
import { toast } from 'react-toastify';
import {AudioIcon, AudioOffIcon, VideoIcon, VideoOffIcon} from "@components/icons"

export default function VideoController({localAudioTrackRef, localVideoTrackRef}) {
    const chatCtx = useContext(ChatContext);

    const toggleSound = async () => {
        await localAudioTrackRef.current.setEnabled(!chatCtx.isAudioEnabled);
        chatCtx.toggleIsAudioEnabled(! chatCtx.isAudioEnabled)
        toast.success(`Audio ${chatCtx.isAudioEnabled ? 'Muted' : 'Unmuted'}`, {
            position: 'top-center',
        });
    };
      
    const toggleVideo = async () => {
        await localVideoTrackRef.current.setEnabled(!chatCtx.isVideoEnabled);
        chatCtx.toggleIsVideoEnabled(! chatCtx.isVideoEnabled)
        toast.success(`Video ${chatCtx.isVideoEnabled ? 'Stopped' : 'Started'}`, {
            position: 'top-center',
        });
    };

    return <div className="bg-white bg-opacity-10 p-4 rounded-lg shadow-lg">
        <h3 className="text-center font-bold text-lg mb-4">Setting Up</h3>
        <div className="flex gap-4 justify-center">
            <button
                className="bg-white p-4 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition"
                onClick={toggleSound}
            >
                {chatCtx.isAudioEnabled ? <AudioIcon /> : <AudioOffIcon />}
            </button>
            <button
                className="bg-white p-4 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition"
                onClick={toggleVideo}
            >
                {chatCtx.isVideoEnabled ? <VideoIcon /> : <VideoOffIcon />}
            </button>
        </div>
    </div>;
}