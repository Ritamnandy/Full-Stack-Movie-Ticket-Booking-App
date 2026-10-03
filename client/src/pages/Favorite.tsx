import { Link } from "react-router-dom";
import { dummyShowsData } from "../assets/assets";
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";

export default function Favorite ()
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
        <div className = "relative min-h-screen flex items-center justify-center px-6 overflow-hidden" >
            <BlurCircle topValue="120px" leftValue="10%" />
            <BlurCircle bottomValue="40px" rightValue="10%" />

            <div className="relative z-10 w-full max-w-lg text-center rounded-3xl border border-dashed border-white/15 bg-white/3 backdrop-blur-md px-8 py-12 shadow-2xl">
                {/* Heart with ripple rings */}
                <div className="relative mx-auto mb-8 flex items-center justify-center w-28 h-28">
                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <span className="absolute inset-3 rounded-full bg-primary/20 animate-pulse" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-primary to-pink-500 shadow-lg shadow-primary/40">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-9 h-9 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                        </svg>
                    </div>
                </div>

                <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">
                    Wishlist
                </p>
                <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-white via-primary to-pink-400 bg-clip-text text-transparent">
                    No favorites yet
                </h1>
                <p className="mt-4 text-gray-400 text-sm md:text-base leading-relaxed">
                    Your collection is empty. Save the movies you love and
                    they'll show up here, ready whenever you are.
                </p>

                {/* Tips */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-gray-300">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        ♡ Tap the heart
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        Save for later
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        Book faster
                    </span>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                    <Link
                        to="/movies"
                        onClick={() => window.scrollTo(0, 0)}
                        className="px-7 py-3 rounded-full bg-linear-to-r from-primary to-pink-500 hover:opacity-90 hover:scale-105 active:scale-95 transition font-medium text-sm shadow-lg shadow-primary/30"
                    >
                        Discover Movies
                    </Link>
                    <Link
                        to="/"
                        onClick={() => window.scrollTo(0, 0)}
                        className="px-7 py-3 rounded-full border border-white/15 hover:bg-white/10 transition font-medium text-sm"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div >


    )
}