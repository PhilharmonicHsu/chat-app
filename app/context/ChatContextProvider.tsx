import {createContext, useState} from 'react'


// 定義 Context 類型
interface ChatContextType {
    mode: string;
    toggleMode: (mode: string) => void;
    nickname: string,
    toggleNickname: (nickname: string) => void;
}

export const ChatContext = createContext<ChatContextType>({
    mode: 'chat',
    toggleMode: () => {},
    nickname: '',
    toggleNickname: () => {}
});

export default function ChatContextProvider({children}) {
    const [mode, setMode] = useState('preparing');
    const [nickname, setNickname] = useState('');

    const toggleMode = (mode: string) => {
        setMode(mode)
    }

    const toggleNickname = (nickname: string) => {
        setNickname(nickname)
    }

    const value = {
        mode,
        toggleMode,
        nickname,
        toggleNickname
    }

    return <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>    
}