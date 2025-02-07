import {useMemo, forwardRef, useImperativeHandle, useRef} from 'react';
import GLOBAL_CONFIG from '@utils/globals'
import { IAgoraRTCRemoteUser, ICameraVideoTrack } from '@/types'

const UserVideoArea = forwardRef(({remoteUsers, isSharingScreen}: {remoteUsers: IAgoraRTCRemoteUser[], isSharingScreen: boolean}, ref) => {
    const selfScreenRef = useRef(null)

    useImperativeHandle(ref, () => ({
        playSelfVideo: (videoTrack: ICameraVideoTrack) => {
            videoTrack?.play(selfScreenRef.current)
        }
    }))

    const userVideoBarClasses = useMemo(() => {
        const classes = ['bg-gray-800', 'gap-2', 'items-center', 'p-2'];

        if (isSharingScreen) {
            classes.push(...['h-auto', 'max-h-[200px]', 'w-auto', 'flex', 'overflow-x-scroll']);
        } else {
            const userAmount = [...remoteUsers].filter(user => user.uid !== GLOBAL_CONFIG.SCREEN_SHARE_UID).length + 1; // plus self

            let cols = 'grid-rows-2 grid-cols-2'

            if (userAmount === 1) {
                cols = 'grid-rows-1 grid-cols-1'
            } else if (userAmount === 2) {
                cols = 'grid-rows-1 grid-cols-2'
            } else if (userAmount === 3 || userAmount === 4) {
                cols = 'grid-rows-2 grid-cols-2'
            } else if (userAmount === 5 || userAmount === 6) {
                cols = 'grid-rows-2 grid-cols-3'
            } else if (userAmount >= 7 || userAmount <= 9) {
                cols = 'grid-rows-3 grid-cols-3'
            } else if (userAmount >= 10 || userAmount <= 12) {
                cols = 'grid-rows-3 grid-cols-4'
            } else {
                cols = 'grid-rows-4 grid-cols-4'
            }

            classes.push(...['flex-1', 'grid', cols, 'auto-cols-auto', 'overflow-y-auto']);
        }

        return classes.join(' ');
    }, [isSharingScreen, remoteUsers]);

    const userVideoClasses = () => {
        const classes = ['bg-gray-400', 'rounded-lg', 'overflow-hidden', 'aspect-video'];
        
        if (isSharingScreen) {
            classes.push(...['user-video', 'h-[200px]'])
        } else {
            classes.push(...['flex-1'])
        }

        return classes.join(' ');
    }

    return (
        <div className={userVideoBarClasses}>
            {[...remoteUsers].filter(user => user.uid !== GLOBAL_CONFIG.SCREEN_SHARE_UID).map(user => (
                <div
                key={user.uid}
                className={userVideoClasses()}
                ref={(el) => el && user.videoTrack?.play(el)}
                /> 
            ))}
            {/* 自己的畫面 */}
            <div
                className={userVideoClasses()}
                ref={selfScreenRef}
            />
        </div>
    )
})

UserVideoArea.displayName = 'UserVideoArea';

export default UserVideoArea;