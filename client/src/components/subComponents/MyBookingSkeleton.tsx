import BlurCircle from "../BlurCircle";


export default function MyBookingSkeleton ( { count = 3 }: { count?: number } )
{
    return (
        <div
            role="status"
            aria-busy="true"
            aria-live="polite"
            className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]"
        >
            <span className="sr-only">Loading your bookings...</span>

            <BlurCircle topValue="100px" leftValue="100px" />
            <BlurCircle bottomValue="0px" leftValue="600px" />

            {/* Page title */ }
            <h1 className="text-lg md:text-2xl font-semibold mb-4">My Bookings</h1>

            { Array.from( { length: count } ).map( ( _, i ) => (
                <div
                    key={ i }
                    style={ { animationDelay: `${ i * 120 }ms` } }
                    className="animate-skeleton-in flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
                >
                    {/* Left: poster + details */ }
                    <div className="flex flex-col md:flex-row">
                        <div className="skeleton md:w-45 aspect-video rounded" />
                        <div className="flex flex-col gap-2 p-4">
                            <div className="skeleton h-5 w-44 rounded" />
                            <div className="skeleton h-3.5 w-16 rounded" />
                            <div className="skeleton h-3.5 w-36 rounded mt-6" />
                        </div>
                    </div>

                    {/* Right: amount + seats */ }
                    <div className="flex flex-col md:items-end justify-between gap-4 p-4">
                        <div className="flex items-center gap-4">
                            <div className="skeleton h-7 w-24 rounded" />
                            <div className="skeleton h-8 w-24 rounded-full" />
                        </div>
                        <div className="flex flex-col gap-2 md:items-end">
                            <div className="skeleton h-3.5 w-32 rounded" />
                            <div className="skeleton h-3.5 w-40 rounded" />
                        </div>
                    </div>
                </div>
            ) ) }
        </div>
    );
}