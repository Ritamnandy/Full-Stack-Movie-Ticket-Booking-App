import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import BlurCircle from "./BlurCircle"
import GlowBtn from "./subComponents/GlowBtn"
import { dummyShowsData } from "../assets/assets"
import MovieCard from "./MovieCard"



const FeaturesSection = () =>
{

    const navigate = useNavigate()

    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">

            <div className="relative items-center pt-20 pb-10 flex justify-between">
                <BlurCircle topValue="0" rightValue="-80px" />
                <p className="text-gray-300 font-medium text-lg">Now Showing</p>
                <button type="button" className="group active:scale-95 transition text-sm flex items-center gap-2 text-gray-300 cursor-pointer" onClick={ () => navigate( "/movies" ) }>
                    View All
                    <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5 " />
                </button>
            </div>
            {/* card grid */ }
            <div className="flex flex-wrap max-sm:justify-center gap-8 mt-8">
                {
                    dummyShowsData.map( ( show ) => (
                        <MovieCard key={ show._id } movie={ {
                            genres: show.genres,
                            id: show._id,
                            image: show.backdrop_path,
                            rating: show.vote_average,
                            releaseDate: show.release_date,
                            runTime: show.runtime.toString(),
                            title: show.title,
                        } } />
                    ) )
                }
            </div>

            <div className="mt-10">
                <GlowBtn title="Show more" onClick={ () => { navigate( "/movies" ); scrollTo( 0, 0 ) } } />
            </div>
        </div>
    )
}

export default FeaturesSection