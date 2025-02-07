import {BeatLoader} from 'react-spinners'
import { motion } from "framer-motion";
import {useState} from 'react'

export default function Introduction({handleCreateRoom}) {
    const [isClickCreate, setIsClickCreate] = useState(false)

    const handleClick = () => {
        handleCreateRoom();
        setIsClickCreate(true);
    };

    return <div className="text-center">
        <motion.h1 
          className="text-5xl font-extrabold text-white mb-6 font-[Poppins] relative z-[2]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to Green Island
        </motion.h1>
        <motion.article
          className="text-lg text-white text-center mb-8 w-full relative z-[2]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          A place where you and your companions can connect through words, images, and even video. <br/>
          And when you leave, we will gently erase all traces of what was shared, like a fleeting stay on a tranquil vacation island— <br/>
          where the memories linger only in your heart...
        </motion.article>
        <div className="flex justify-center items-center min-h-[60px]">
          {isClickCreate 
            ? (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              key="box"
              className="relative z-[2]"
            >
              <BeatLoader size={10} color="#ffffff" />
            </motion.div>
          ): (
            <motion.button
              className="relative z-[2] bg-gradient-to-r from-[#6B93D6] to-[#375A96] px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              onClick={handleClick}
            >
              Create Room
            </motion.button>
          )}
        </div>
      </div>
}