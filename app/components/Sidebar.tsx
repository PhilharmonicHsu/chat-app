import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { TiTimes } from "react-icons/ti";

export default function Sidebar({children}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isContentVisible, setIsContentVisible] = useState(true);

    const handleToggleMenu = () => {
        setIsContentVisible(false);
        setIsMenuOpen((prev) => !prev);
        setTimeout(() => {
          setIsContentVisible(true);
        }, 500);
      }
    
      const sideBarWidth = isMenuOpen ? 'min-w-[25%]' : 'min-w-20';
      const buttonPosition = isMenuOpen ? 'justify-end' : 'justify-center'

    return (
        <div 
          className={`absolute top-0 left-0 h-screen ${sideBarWidth} bg-gradient-to-b from-[#5A5A5A] to-[#836953] text-white p-4 flex flex-col gap-6 overflow-hidden transition-all duration-500 ease-in-out`}
          style={{zIndex: 9999}}
        >
        <button
          className={`lg p-2 rounded-full flex ${buttonPosition}`}
          onClick={handleToggleMenu}
        >
          <span className={isContentVisible ? "opacity-100" : "opacity-0"}>
            {isMenuOpen ? <TiTimes size={24} /> : <FiMenu size={24} />}
          </span>
        </button>
          {isMenuOpen && isContentVisible && <>
            {children}
          </>}
        </div>
  
    )
}