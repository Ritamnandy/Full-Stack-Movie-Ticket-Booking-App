import BlurCircle from "../BlurCircle";



export default function MovieDetailsSkeleton ()
{
    return (
        <div
            role="status"
            aria-busy="true"
            aria-live="polite"
            className="relative px-6 md:px-16 lg:px-40 md:pt-50 animate-skeleton-in mt-30"
        >
            <span className="sr-only">Loading movie details...</span>

            {/* Top section */ }
            <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
                {/* Poster */ }
                <div className="skeleton max-md:mx-auto rounded-lg h-104 w-70 max-w-70 shrink-0" />

                <div className="relative flex flex-col gap-3 flex-1">
                    <BlurCircle topValue="-100px" leftValue="-100px" />

                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-10 w-full max-w-96 rounded-md" />
                    <div className="skeleton h-10 w-2/3 max-w-72 rounded-md" />

                    <div className="skeleton h-4 w-36 rounded mt-1" />

                    <div className="mt-3 flex flex-col gap-2 max-w-xl">
                        <div className="skeleton h-3 w-full rounded" />
                        <div className="skeleton h-3 w-full rounded" />
                        <div className="skeleton h-3 w-5/6 rounded" />
                        <div className="skeleton h-3 w-2/3 rounded" />
                    </div>

                    <div className="skeleton h-4 w-64 rounded mt-2" />

                    {/* Buttons */ }
                    <div className="flex items-center flex-wrap gap-4 mt-4">
                        <div className="skeleton h-11 w-40 rounded-md" />
                        <div className="skeleton h-11 w-36 rounded-md" />
                        <div className="skeleton h-11 w-11 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Cast */ }
            <div className="skeleton h-6 w-52 rounded mt-10" />
            <div className="overflow-hidden mt-8 pb-4">
                <div className="flex items-start gap-4 w-max px-4">
                    { Array.from( { length: 8 } ).map( ( _, i ) => (
                        <div key={ i } className="flex flex-col items-center gap-2">
                            <div className="skeleton h-20 w-20 rounded-full" />
                            <div className="skeleton h-3 w-16 rounded" />
                        </div>
                    ) ) }
                </div>
            </div>

            {/* Date select */ }
            <div className="skeleton h-28 w-full max-w-4xl rounded-xl mt-16" />

            {/* You may also like */ }
            <div className="skeleton h-6 w-44 rounded mt-20 mb-8" />
            <div className="flex flex-wrap max-sm:justify-center gap-8">
                { Array.from( { length: 4 } ).map( ( _, i ) => (
                    <div
                        key={ i }
                        className="flex flex-col gap-3 w-66 p-3 rounded-2xl bg-white/3 border border-white/5"
                    >
                        <div className="skeleton h-52 w-full rounded-lg" />
                        <div className="skeleton h-4 w-3/4 rounded" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                        <div className="flex items-center justify-between mt-2">
                            <div className="skeleton h-8 w-24 rounded-full" />
                            <div className="skeleton h-4 w-10 rounded" />
                        </div>
                    </div>
                ) ) }
            </div>
        </div>
    );
}