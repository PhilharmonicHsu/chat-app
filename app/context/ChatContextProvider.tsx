import {createContext, useState} from 'react'

export enum Mode {
    CHAT = 'chat',
    MEETING = 'meeting',
    PREPARING = 'preparing'
}

// 定義 Context 類型
interface ChatContextType {
    mode: string;
    toggleMode: (mode: string) => void;
    nickname: string,
    toggleNickname: (nickname: string) => void;
    isAudioEnabled: boolean,
    toggleIsAudioEnabled: (status: boolean) => void;
    isVideoEnabled: boolean,
    toggleIsVideoEnabled: (status: boolean) => void;
    roomId: string,
    toggleRoomId: (roomId: string) => void;
}

export const ChatContext = createContext<ChatContextType>({
    mode: Mode.CHAT,
    toggleMode: () => {},
    nickname: '',
    toggleNickname: () => {},
    isAudioEnabled: true,
    toggleIsAudioEnabled: () => {},
    isVideoEnabled: true,
    toggleIsVideoEnabled: () => {},
    roomId: '',
    toggleRoomId: () => {}
});

export default function ChatContextProvider({children}) {
    const [mode, setMode] = useState<string>(Mode.MEETING);
    const [nickname, setNickname] = useState('');
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [roomId, setRoomId] = useState('');

    const toggleMode = (mode: string) => {
        setMode(mode)
    }

    const toggleNickname = (nickname: string) => {
        setNickname(nickname)
    }

    const toggleIsAudioEnabled = (status: boolean) => {
        setIsAudioEnabled(status);
    }

    const toggleIsVideoEnabled = (status: boolean) => {
        setIsVideoEnabled(status);
    }

    const toggleRoomId = (roomId: string) => {
        setRoomId(roomId);
    }

    const value = {
        mode,
        toggleMode,
        nickname,
        toggleNickname,
        isAudioEnabled,
        toggleIsAudioEnabled,
        isVideoEnabled,
        toggleIsVideoEnabled,
        roomId,
        toggleRoomId
    }

    return <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>    
}