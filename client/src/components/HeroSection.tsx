import { Calendar, Clock } from "lucide-react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";


export default function HeroSection ()
{


    const navigate = useNavigate()

    return (
        <div className="relative flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 h-screen overflow-hidden bg-[url('/backgroundImage.png')] bg-cover bg-center">
            <motion.div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-black/45 via-transparent to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
            <motion.img src={ assets.marvelLogo } alt="Marvel Logo" className="relative max-h-11 lg:h-11 mt-20" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.45 }} />
            <motion.h1 className="relative text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.55 }}>Guardians <br /> of the Galaxy</motion.h1>
            <motion.div className="relative flex items-center gap-4 text-gray-300" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.45 }}>
                <span>Action | Adventure | Sci-Fi</span>
                <div className="flex items-center gap-1">
                    <Calendar className="w-4.5 h-4.5" />
                    <span>2018</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-4.5 h-4.5" />
                    <span>2h 8m</span>
                </div>
            </motion.div>
            <motion.p className="relative text-gray-300 max-w-md" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.45 }}>In a post-apocalyptic world where cities ride on wheels and consume each other to survive, two people meet in London and try to stop a conspiracy.</motion.p>
            <motion.button type="button"
                onClick={ () => navigate( '/movies' ) }
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54, duration: 0.45 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="relative bg-primary text-primary-content text-sm flex items-center px-4 py-2 gap-2 rounded w-max border border-transparent hover:bg-transparent duration-300 cursor-pointer hover:border-primary-dull mt-10">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.665 1.333 7.332 8.667m7.333-7.334L10 14.666l-2.667-6m7.333-7.333L1.332 6l6 2.667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Explore more
            </motion.button>
        </div>
    )
}
