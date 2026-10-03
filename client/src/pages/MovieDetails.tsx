import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyShowsData, type DummyShow } from "../assets/assets";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import MovieDetailsSkeleton from "../components/subComponents/MovieDetailsSkeleton";



export default function MovieDetails ()
{
    const navigate = useNavigate()
    const { id } = useParams();
    const [ show, setShow ] = useState<DummyShow | null>( null )
    const timeInHours = show ? Math.floor( show.runtime / 60 ) : 0;
    const timeInMinutes = show ? show.runtime % 60 : 0;

    const getShow = async () =>
    {
        setTimeout( () =>
        {
            const response = dummyShowsData.find( ( show ) => show._id === id )
            if ( response )
            {
                setShow( response )
            }
        }, 2000 )
    }

    useEffect( () =>
    {
        getShow()
    }, )




    return show ? (
        <div className="px-6 md:px-16 lg:px-40 md:pt-50 mt-30">

            <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">

                <img src={ show.poster_path } alt="" className="max-md:mx-auto rounded-lg h-104 max-w-70 object-cover" />

                <div className="relative flex flex-col gap-3">

                    <BlurCircle topValue="-100px" leftValue="-100px" />
                    <p className="text-primary">ENGLISH</p>
                    <h1 className="text-4xl font-semibold max-w-96 text-balance">{ show.title }</h1>
                    <div className="flex items-center gap-2 text-gray-300">

                        <StarIcon className="w-5 h-5 text-primary fill-primary" />
                        {
                            show.vote_average.toFixed( 1 )
                        } User Rating
                    </div>
                    <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">{ show.overview }</p>
                    <p>{ timeInHours > 0
                        ? `${ timeInHours }h ${ timeInMinutes }m`
                        : `${ timeInMinutes }m` }{ "  " }  . { show.genres
                            .slice( 0, 2 )
                            .map( ( genre ) => genre.name )
                            .join( " | " ) }{ " " }. { new Date( show.release_date ).getFullYear() }</p>
                    <div className="flex items-center flex-wrap gap-4 mt-4">
                        <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
                            <PlayCircleIcon className="w-5 h-5" />
                            Watch Trailer
                        </button>
                        <a href="#dateSelect" className="px-10 py-3 text-sm bg-primary hover:bg-primary transition rounded-md font-medium cursor-pointer active:scale-95">Buy Tickets</a>
                        <button className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95">
                            <Heart className={ `w-5 h-5` } />
                        </button>
                    </div>
                </div>





            </div>

            <p className="text-xl font-semibold mt-10">Your Favorite Cast</p>
            <div className="overflow-x-auto no-scrollbar mt-8 pb-4">

                <div className="flex items-center gap-4 w-max px-4">
                    {
                        show.casts.slice( 0, 11 ).map( ( cast ) => (
                            <div key={ cast.name } className="flex flex-col items-center text-center">
                                <img src={ cast.profile_path } alt={ cast.name } className="h-20 md:h-20 aspect-square object-cover rounded-full" />
                                <p className="">{ cast.name }</p>
                            </div>
                        ) )
                    }
                </div>
            </div>

            <DateSelect dateTime={ show.release_date } id={ show.id.toString() } />

            <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>

            <div className="flex flex-wrap max-sm:justify-center gap-8">

                {
                    dummyShowsData.slice( 0, 4 ).map( ( movie, index ) => (
                        <MovieCard key={ index } movie={ {
                            id: movie._id,
                            genres: movie.genres,
                            image: movie.backdrop_path,
                            rating: movie.vote_average,
                            releaseDate: movie.release_date,
                            runTime: movie.runtime.toString(),
                            title: movie.title
                        } } />
                    ) )
                }
            </div>
            <div className="flex justify-center mt-20">
                <button onClick={ () => { navigate( '/movies' ); scrollTo( 0, 0 ) } } className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md fonbuttonum cursor-pointer">Show more</button>
            </div>
        </div>
    ) : (
        <MovieDetailsSkeleton />
    )
}
