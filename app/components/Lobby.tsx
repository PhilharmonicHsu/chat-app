import { useState } from "react";
import { encryptData} from "@utils/crypto";
import { useRouter } from "next/navigation";
import Button from '@components/Common/Button';

export default function Lobby({roomId}) {
    const [nickname, setNickname] = useState<string>("");
    const router = useRouter();

    const handleNicknameSubmit = () => {
        const data = {
            roomId,
            nickname
        }
        const code = encryptData(data)

        router.push(`/chat/${code}`)
    };

    return <div className="h-screen flex justify-center items-center bg-gradient-to-b from-[#5A5A5A] to-[#836953]">
        <div className="text-center bg-white shadow-lg rounded-lg p-6 w-[30rem] flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold mb-4 text-black">Enter your Nickname</h2>
            <input
            type="text"
            placeholder="Your Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="border px-4 py-2 rounded-lg w-full mb-4 text-black"
            />
            <Button
            color="brown"
            onClick={handleNicknameSubmit}
            >
            Enter Room
            </Button>
        </div>
    </div>
}