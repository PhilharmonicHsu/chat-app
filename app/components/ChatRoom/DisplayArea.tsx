import { useContext } from 'react'
import { ChatContext } from "@context/ChatContextProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ImageMessage from "@components/ChatRoom/ImageMessage";

export default function DisplayArea({messages}) {
    const chatCtx = useContext(ChatContext);

    const renderers = {
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match?.[1] || "plaintext";
    
          return ! inline && match ? (
            <SyntaxHighlighter
              style={atomDark}
              language={language}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-gray-200 px-2 py-1 rounded">{children}</code>
          );
        },
        p: ({ children, ...props }) => {
          return <span className="inline-block text-black bg-white text-xl px-2 py-1 rounded-md border border-solid border-black whitespace-pre-wrap break-words" {...props}>
            {children}
          </span>
        },
    };

    const messageClass = (index: number, type: string, nickname: string): string => {
        const classes = ["mb-2"]
        if (index !== 0) {
          classes.push("mt-2")
        }
    
        classes.push("flex")
    
        if (chatCtx.nickname === nickname) {
          classes.push("justify-end")
        }
    
        if (type === 'image') {
          classes.push("gap-2")
        } else {
          if (chatCtx.nickname !== nickname) {
            classes.push('gap-2')
            classes.push('items-center')
          }
        }
    
        return classes.join(" ")
    }

    return <div className="text-black flex-grow bg-gray-100 p-4 overflow-y-auto">
        {messages.map((msg, idx) => (
            <div key={idx} className={messageClass(idx, msg.type, msg.nickname)}>
            {chatCtx.nickname !== msg.nickname ? <span>{msg.nickname} :</span> : <></>}
            {msg.type === "text" ? (
                <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={renderers}
                >
                {msg.content}
                </ReactMarkdown>
            ) : (
                <ImageMessage context={msg.content} />
            )}
            </div>
        ))}
    </div>
}