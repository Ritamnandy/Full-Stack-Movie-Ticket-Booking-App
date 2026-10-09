import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clapperboard, Film, Home } from "lucide-react";
import BlurCircle from "../components/BlurCircle";

export default function NotFound ()
{
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 py-28 text-center">
            <BlurCircle topValue="100px" leftValue="10%" />
            <BlurCircle bottomValue="40px" rightValue="10%" />

            <div className="animate-card-in relative flex flex-col items-center">
                {/* Floating icon */ }
                <div className="relative mb-2 flex h-20 w-20 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="animate-float relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg shadow-primary/20">
                        <Clapperboard className="w-8 h-8 text-primary" />
                    </div>
                </div>

                {/* 404 */ }
                <h1 className="select-none bg-linear-to-r from-white via-primary to-pink-500 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent md:text-9xl">
                    404
                </h1>

                <div className="my-5 h-1 w-16 rounded-full bg-linear-to-r from-primary to-pink-500 md:my-6" />

                <p className="text-xs uppercase tracking-[0.3em] text-primary">Scene not found</p>
                <h2 className="mt-3 text-2xl font-bold md:text-3xl">Page Not Found</h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-400 md:text-base">
                    The page you are looking for might have been removed, had its name changed, or is
                    temporarily unavailable.
                </p>

                {/* Actions */ }
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                    <Link
                        to="/"
                        onClick={ () => window.scrollTo( 0, 0 ) }
                        className="flex items-center gap-2 rounded-full bg-linear-to-r from-primary to-pink-500 px-7 h-12 text-sm font-semibold shadow-lg shadow-primary/30 transition hover:opacity-90 active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        Return Home
                    </Link>

                    <Link
                        to="/movies"
                        onClick={ () => window.scrollTo( 0, 0 ) }
                        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 h-12 text-sm font-medium transition hover:bg-white/10 active:scale-95"
                    >
                        <Film className="w-4 h-4" />
                        Browse Movies
                    </Link>
                </div>

                {/* Secondary links */ }
                <div className="mt-8 flex items-center gap-5 text-sm text-gray-400">
                    <button
                        type="button"
                        onClick={ () => navigate( -1 ) }
                        className="flex items-center gap-1.5 transition hover:text-white cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back
                    </button>
                    <span className="h-4 w-px bg-white/15" />
                    <a
                        href="mailto:support@quickshow.com"
                        className="transition hover:text-white"
                    >
                        Contact support
                    </a>
                </div>
            </div>
        </div>
    );
}