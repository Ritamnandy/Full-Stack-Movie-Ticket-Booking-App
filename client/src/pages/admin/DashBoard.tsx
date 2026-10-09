import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { dummyDashboardData, type DashBoardType } from "../../assets/assets"
import AdminTitle from "../../components/admin/AdminTitle"
import BlurCircle from "../../components/BlurCircle"
import { formatDate } from "../../lib/dateFormat"
import DashboardSkeleton from "../../components/subComponents/DashboardSkeleton"
import { motion } from "motion/react"



export default function DashBoard ()
{

    const currency = import.meta.env.VITE_CURRENCY as string;

    const [ stats, setStats ] = useState<DashBoardType>( {
        totalBookings: 0,
        totalRevenue: 0,
        activeShows: [],
        totalUser: 0,
    } )

    const [ loading, setLoading ] = useState( true )

    const DashBoardCards = [
        {
            title: "Total Bookings",
            value: stats.totalBookings || 0,
            icon: <ChartLineIcon />,
        },
        {
            title: "Total Revenue",
            value: `${ currency } ${ stats.totalRevenue || 0 }`,
            icon: <CircleDollarSignIcon />,
        },
        {
            title: "Active Shows",
            value: stats.activeShows.length || 0,
            icon: <PlayCircleIcon />,
        },
        {
            title: "Total Users",
            value: stats.totalUser || 0,
            icon: <UsersIcon />,
        },
    ]

    const fetchDashBoardsData = () =>
    {
        setStats( dummyDashboardData )
        setLoading( false )
    }

    useEffect( () =>
    {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDashBoardsData()
    }, [] )


    return !loading ? (
        <>
            <AdminTitle text1="Admin" text2="Dashboard" />
            <div className="relative flex flex-wrap gap-4 mt-6">
                <BlurCircle topValue="-100px" leftValue="0" />
                <div className="flex flex-wrap gap-4 w-full">
                    {
                        DashBoardCards.map( ( card, index ) => (
                            <motion.div key={ index } initial={ { opacity: 0, y: 12 } } animate={ { opacity: 1, y: 0 } } transition={ { delay: index * 0.07, duration: 0.3 } } whileHover={ { y: -3 } } className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full">
                                <div>
                                    <h1 className="text-sm text-primary/70">{ card.title }</h1>
                                    <p className="text-xl font-medium mt-1">{ card.value }</p>
                                </div>
                                { card.icon }
                            </motion.div>
                        ) )
                    }

                </div>

            </div>
            <p className="mt-10 text-lg font-medium ">Active Shows</p>
            <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
                <BlurCircle topValue="100px" leftValue="-10%" />
                {
                    stats.activeShows.map( ( show, index ) => (
                        <motion.div key={ index } initial={ { opacity: 0, y: 16 } } animate={ { opacity: 1, y: 0 } } transition={ { delay: index * 0.08, duration: 0.35 } } whileHover={ { y: -5 } } className="w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 transition duration-300 p-2">
                            <img src={ show.movie.poster_path } alt={ show.movie.title } className="w-full h-60 object-cover rounded-lg" />
                            <p className="p-2 truncate font-medium">{ show.movie.title }</p>
                            <div className="flex items-center justify-between px-2 ">
                                <p className="text-lg font-medium">{ currency } { show.showPrice }</p>
                                <p className="flex  items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                                    {
                                        show.movie.vote_average.toFixed( 1 )
                                    }
                                </p>
                            </div>
                            <p className="px-2 pt-2 text-sm text-gray-500">
                                {
                                    formatDate( show.showDateTime )
                                }
                            </p>

                        </motion.div>
                    ) )
                }

            </div>
        </>
    ) : (
            <DashboardSkeleton/>
    )
}
