import AdminTitle from "../admin/AdminTitle";


export default function ListBookingsSkeleton ( { rows = 6 }: { rows?: number } )
{
    return (
        <div role="status" aria-busy="true" aria-live="polite">
            <span className="sr-only">Loading shows...</span>

            <AdminTitle text1="List" text2="Shows" />

            <div className="max-w-4xl mt-6 overflow-x-auto">
                <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
                    <thead>
                        <tr className="bg-primary/20 text-left text-white">
                            <th className="p-2 font-medium pl-5">User Name</th>
                            <th className="p-2 font-medium">Movie Name</th>
                            <th className="p-2 font-medium"> Show Time</th>
                            <th className="p-2 font-medium">Seats</th>
                            <th className="p-2 font-medium">Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        { Array.from( { length: rows } ).map( ( _, i ) => (
                            <tr
                                key={ i }
                                style={ { animationDelay: `${ i * 90 }ms` } }
                                className="animate-skeleton-in border-b border-gray-200"
                            >
                                <td className="p-3 pl-5">
                                    <div className="skeleton h-4 w-40 rounded" />
                                </td>
                                <td className="p-3">
                                    <div className="skeleton h-4 w-36 rounded" />
                                </td>
                                <td className="p-3">
                                    <div className="skeleton h-4 w-10 rounded" />
                                </td>
                                <td className="p-3">
                                    <div className="skeleton h-4 w-20 rounded" />
                                </td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>
        </div>
    );
}