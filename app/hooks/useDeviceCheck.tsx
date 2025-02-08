'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function useDeviceCheck() {
    const router = useRouter();

    useEffect(() => {
        // 檢查使用者裝置是否為手機
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );

        // 檢查使用者是否使用 Safari
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (isMobileDevice) {
            alert("This website only supports tablets and computers");
            router.push("/"); // 返回首頁
        } else if (isSafari) {
            alert("This site is not supported by Safari");
            router.push("/"); // 返回首頁
        }
    }, [router]);
}

export default useDeviceCheck;
