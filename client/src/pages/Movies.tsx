import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../config/api.config";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";

export default function Movies ()
{
    const [ shows, setShows ] = useState<Any[]>( [] )
    const [ loading, setLoading ] = useState( true )

    const fetchShows = async () =>
    {
        try
        {
            const data = await api( "/movies" )
            setShows( data.data ?? [] )
        } catch ( err )
        {
            console.error( 'Error fetching movies:', err )
        }
        setLoading( false )
    }

    useEffect( () =>
    {
        fetchShows()
    }, [] )

    return loading ? (
        <BlurCircle topValue="150px" leftValue="0px" />
            <BlurCircle bottomValue="50px" rightValue="50px" />
            <div className="relative flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-lg font-medium my-4">Loading Movies...</h1>
            </div>
    ) : (
        <div className="relative my-30 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
            <BlurCircle topValue="150px" leftValue="0px" />
            <BlurCircle bottomValue="50px" rightValue="50px" />
            <h1 className="text-lg font-medium my-4">Now Showing</h1>

            <div className="flex flex-wrap max-sm:justify-center gap-8 ">
                {
                    shows.map( ( show ) => (
                        <MovieCard key={ show.id } movie={ {
                            id: show.id,
                            title: show.title,
                            rating: show.vote_average,
                            genres: show.genres
                            , image: show.backdrop_path,
                            releaseDate: show.release_date
                            , runTime: show.runtime.toString()
                        } } />
                    ) )
                }
            </div>

        </div>
    )
}
