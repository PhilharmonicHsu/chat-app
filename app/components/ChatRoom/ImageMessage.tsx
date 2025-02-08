import Image from "next/image";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import {useState} from 'react';

export default function ImageMessage({context}: {context: string}) {
    const [isFull, setIsFull] = useState(false);
    const handle = useFullScreenHandle();

    const handleClick = () => {
        handle.enter()
    }

    return <div className="rounded-lg shadow-md border border-solid border-black p-4">
        <Image 
            src={context} 
            alt="uploaded" 
            width={300}
            height={200}
            objectFit="contain"
            className="max-w-xs rounded-lg shadow-md"
            onClick={handleClick}
        />
        <FullScreen 
            handle={handle} 
            className="relative"
            onChange={(isFull) => setIsFull(isFull)}
        >
            <div className="flex-1 absolute w-screen h-screen">
                <Image 
                    src={context} 
                    alt="uploaded" 
                    layout="fill"
                    objectFit="contain"
                    className={isFull ? "rounded-lg shadow-md" : "hidden rounded-lg shadow-md"}
                />
            </div>
        </FullScreen>
    </div>
}