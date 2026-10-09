import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import BlurCircle from "../components/BlurCircle";

const REDIRECT_MS = 1800;

export default function GoogleSuccess ()
{
    const navigate = useNavigate();

    useEffect( () =>
    {
        const timer = setTimeout( () => navigate( "/", { replace: true } ), REDIRECT_MS );
        return () => clearTimeout( timer );
    }, [ navigate ] );

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden">
            <BlurCircle topValue="120px" leftValue="10%" />
            <BlurCircle bottomValue="40px" rightValue="10%" />

            <div
                role="status"
                aria-live="polite"
                className="animate-card-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-primary/10"
            >
                {/* Glow accents */ }
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-green-500/20 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-primary/20 blur-[90px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-green-400 to-transparent" />

                <div className="relative flex flex-col items-center px-7 sm:px-9 pt-10 pb-8 text-center">
                    {/* Icon */ }
                    <div className="relative flex h-20 w-20 items-center justify-center">
                        <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                        <div className="animate-pop-in relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30">
                            <Check className="w-8 h-8 text-white" strokeWidth={ 3 } />
                        </div>
                    </div>

                    <p className="mt-6 text-sm font-bold tracking-tight">
                        <span className="text-primary">Q</span>uickShow
                    </p>
                    <h1 className="mt-3 text-xl font-semibold">Login successful</h1>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                        You're signed in with Google. Taking you to QuickShow...
                    </p>

                    {/* Redirect progress */ }
                    <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="animate-progress-fill h-full rounded-full bg-linear-to-r from-primary to-pink-500"
                            style={ { animationDuration: `${ REDIRECT_MS }ms` } }
                        />
                    </div>

                    <button
                        type="button"
                        onClick={ () => navigate( "/", { replace: true } ) }
                        className="group mt-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition cursor-pointer"
                    >
                        Continue now
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}