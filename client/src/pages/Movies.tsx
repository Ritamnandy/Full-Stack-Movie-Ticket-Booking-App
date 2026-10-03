import { Link } from "react-router-dom";
import { dummyShowsData } from "../assets/assets";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";

export default function Movies ()
{
    return dummyShowsData.length > 0 ? (
        <div className="relative my-30 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
            <BlurCircle topValue="150px" leftValue="0px" />
            <BlurCircle bottomValue="50px" rightValue="50px" />
            <h1 className="text-lg font-medium my-4">Now Showing</h1>

            <div className="flex flex-wrap max-sm:justify-center gap-8 ">
                {
                    dummyShowsData.map( ( show ) => (
                        <MovieCard key={ show._id } movie={ {
                            id: show._id,
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
    ) : (
        <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
            <BlurCircle topValue="150px" leftValue="0px" />
            <BlurCircle bottomValue="50px" rightValue="50px" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-md">
                {/* Icon */ }
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-11 h-11 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={ 1.5 }
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                    No movies available
                </h1>
                <p className="mt-3 text-gray-400 text-sm md:text-base leading-relaxed">
                    There are no shows scheduled right now. Please check back
                    soon, new releases are added regularly.
                </p>

                {/* Actions */ }
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                        to="/"
                        onClick={ () => window.scrollTo( 0, 0 ) }
                        className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dull transition font-medium text-sm cursor-pointer"
                    >
                        Back to Home
                    </Link>
                    <button
                        onClick={ () => window.location.reload() }
                        className="px-6 py-2.5 rounded-full border border-white/15 hover:bg-white/10 transition font-medium text-sm cursor-pointer"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        </div>

    )
}