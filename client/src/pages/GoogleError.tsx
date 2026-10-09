import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";
import BlurCircle from "../components/BlurCircle";

export default function GoogleError ()
{
    const [ searchParams ] = useSearchParams();
    // Optional: show a reason if your backend redirects with ?message=...
    const reason = searchParams.get( "message" );

    const retry = () =>
    {
        window.location.href = `${ import.meta.env.VITE_API_URL }/auth/google`;
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden">
            <BlurCircle topValue="120px" leftValue="10%" />
            <BlurCircle bottomValue="40px" rightValue="10%" />

            <div
                role="alert"
                className="animate-card-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-primary/10"
            >
                {/* Glow accents */ }
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-red-500/20 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-primary/20 blur-[90px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500 to-transparent" />

                <div className="relative flex flex-col items-center px-7 sm:px-9 py-10 text-center">
                    {/* Icon */ }
                    <div className="relative flex h-20 w-20 items-center justify-center">
                        <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                        <div className="animate-pop-in relative flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/15">
                            <TriangleAlert className="w-8 h-8 text-red-400" />
                        </div>
                    </div>

                    <p className="mt-6 text-sm font-bold tracking-tight">
                        <span className="text-primary">Q</span>uickShow
                    </p>
                    <h1 className="mt-3 text-xl font-semibold">Google login failed</h1>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                        Something went wrong while signing you in. Please try again.
                    </p>

                    { reason && (
                        <p className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300 wrap-break-word">
                            { reason }
                        </p>
                    ) }

                    {/* Actions */ }
                    <div className="mt-8 flex w-full flex-col gap-3">
                        <button
                            type="button"
                            onClick={ retry }
                            className="group flex items-center justify-center gap-2 h-12 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
                            Try again
                        </button>

                        <Link
                            to="/"
                            state={ { openLogin: true } }
                            className="flex items-center justify-center gap-2 h-12 rounded-full border border-white/15 text-sm font-medium hover:bg-white/10 active:scale-[0.98] transition"
                        >
                            Use email instead
                        </Link>

                        <Link
                            to="/"
                            className="mx-auto mt-1 flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}