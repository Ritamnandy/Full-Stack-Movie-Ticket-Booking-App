import AdminTitle from "../admin/AdminTitle";
import BlurCircle from "../BlurCircle";


export default function DashboardSkeleton ( {
    cards = 4,
    shows = 4,
}: {
    cards?: number;
    shows?: number;
} )
{
    return (
        <div role="status" aria-busy="true" aria-live="polite">
            <span className="sr-only">Loading dashboard...</span>

            <AdminTitle text1="Admin" text2="Dashboard" />

            {/* Stat cards */ }
            <div className="relative flex flex-wrap gap-4 mt-6">
                <BlurCircle topValue="-100px" leftValue="0" />
                <div className="flex flex-wrap gap-4 w-full">
                    { Array.from( { length: cards } ).map( ( _, i ) => (
                        <div
                            key={ i }
                            style={ { animationDelay: `${ i * 100 }ms` } }
                            className="animate-skeleton-in flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full"
                        >
                            <div className="flex flex-col gap-2">
                                <div className="skeleton h-3.5 w-24 rounded" />
                                <div className="skeleton h-6 w-16 rounded" />
                            </div>
                            <div className="skeleton h-8 w-8 rounded-full" />
                        </div>
                    ) ) }
                </div>
            </div>

            {/* Active shows */ }
            <div className="skeleton h-6 w-32 rounded mt-10" />
            <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
                <BlurCircle topValue="100px" leftValue="-10%" />
                { Array.from( { length: shows } ).map( ( _, i ) => (
                    <div
                        key={ i }
                        style={ { animationDelay: `${ 400 + i * 120 }ms` } }
                        className="animate-skeleton-in w-55 rounded-lg overflow-hidden pb-3 bg-primary/10 border border-primary/20 p-2"
                    >
                        <div className="skeleton w-full h-60 rounded-lg" />
                        <div className="skeleton h-4 w-3/4 rounded mx-2 mt-4" />
                        <div className="flex items-center justify-between px-2 mt-3">
                            <div className="skeleton h-5 w-16 rounded" />
                            <div className="skeleton h-4 w-12 rounded" />
                        </div>
                        <div className="skeleton h-3.5 w-28 rounded mx-2 mt-3" />
                    </div>
                ) ) }
            </div>
        </div>
    );
}