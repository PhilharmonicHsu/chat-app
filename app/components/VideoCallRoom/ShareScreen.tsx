import { FullScreen, useFullScreenHandle } from "react-full-screen";
import './screen-share.scss';
import {useState, useMemo, forwardRef, useImperativeHandle, useRef} from 'react';
import { ICameraVideoTrack } from '@/types'

const ShareScreen = forwardRef(({isSharingScreen}: {isSharingScreen: boolean}, ref) => {
    const sharingScreenRef = useRef(null);

    useImperativeHandle(ref, () => ({
        playVideo: (videoTrack: ICameraVideoTrack) => {
            videoTrack?.play(sharingScreenRef.current);
        }
    }))

    const handle = useFullScreenHandle();

    const [isFullScreen, setIsFullScreen] = useState(false);

    const handleFullScreen = () => {
        handle.enter()
        setIsFullScreen(true);
    }

    const fullScreenClasses = useMemo(() => {
        let classes: string;

        if (isSharingScreen) {
            classes = 'flex-1 overflow-y-auto h-screen aspect-video flex'

            if (! isFullScreen) {
                classes += ' hover:cursor-pointer'
            }
        } else {
            classes = 'flex-1 overflow-y-auto h-screen aspect-video flex hidden'
        }

        return classes;
    }, [isSharingScreen, isFullScreen]);

    return <>
        <FullScreen handle={handle} 
            onChange={(isFull) => setIsFullScreen(isFull)}
            className={fullScreenClasses} 
        >
            <div 
                ref={sharingScreenRef} 
                className="screen-share flex-1 aspect-video flex justify-center items-center w-full"
                onClick={handleFullScreen}
            />
        </FullScreen>
    </>
}) 

ShareScreen.displayName = 'ShareScreen';

export default ShareScreen;