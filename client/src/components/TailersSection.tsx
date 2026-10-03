import { dummyTrailers, type Trailer } from "../assets/assets"
import { useState } from "react"
import ReactPlayer from "react-player"
import BlurCircle from "./BlurCircle"
import { PlayCircleIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

export default function TailersSection ()
{
    const [ currentTrailler, setCurrentTrailler ] = useState<Trailer>( dummyTrailers[ 0 ] )


    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">

            <p className="text-gray-300 font-medium text-lg wax-w-[960px] mx-auto">Trailers</p>
            <div className="relative mt-6 overflow-hidden rounded-xl">
                <BlurCircle topValue="-100px" rightValue="-100px" />
                <AnimatePresence mode="wait">
                    <motion.div key={currentTrailler.videoUrl} initial={{ opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.985 }} transition={{ duration: 0.35 }}>
                        <ReactPlayer src={ currentTrailler.videoUrl } controls={ false } className="mx-auto max-w-full " width="960px" height="540px" />
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="grid group grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
                { dummyTrailers.map( ( trailer, index ) => (
                    <motion.div key={ index } onClick={ () => setCurrentTrailler( trailer ) } whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group-hover:not-hover:opacity-50 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer">
                        <img src={ trailer.image } alt="trailer" className="w-full h-full rounded-lg object-cover brightness-75" />
                        <PlayCircleIcon strokeWidth={ 1.6 } className="absolute top-1/2 left-1/2 w-5 md:w-8 md:h-12 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"  />
                    </motion.div>
                ) ) }
            </div>
        </div>
    )
}
