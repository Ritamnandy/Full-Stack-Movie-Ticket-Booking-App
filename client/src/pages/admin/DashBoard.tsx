import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { dummyDashboardData, type DashBoardType } from "../../assets/assets"
import AdminTitle from "../../components/admin/AdminTitle"
import BlurCircle from "../../components/BlurCircle"
import { formatDate } from "../../lib/dateFormat"
import DashboardSkeleton from "../../components/subComponents/DashboardSkeleton"
import { motion } from "motion/react"
import { api } from "../../config/api.config"

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

    const loadDashboard = async () =>
    {
      try
      {
        const data = await api( "/admin/dashboard" )
        setStats( data.data ?? {
            totalBookings: 0,
            totalRevenue: 0,
            activeShows: [],
            totalUser: 0,
        } )
      } catch ( err )
      {
        console.error( 'Error fetching dashboard:', err )
      }
      setLoading( false )
    }

    useEffect( () => {
      loadDashboard()
    }, [] )

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

    return !loading ? (
        <>
          <AdminTitle text1="Dashboard" text2="Overview" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            { DashBoardCards.map( ( card, index ) => (
              <motion.div key={ index } initial={ { opacity: 0, y: 16 } } animate={ { opacity: 1, y: 0 } } transition={ { delay: index * 0.08, duration: 0.35, ease: "easeOut" } } className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 truncate">{ card.title }</p>
                    <p className="text-3xl font-bold mt-2">{ card.value }</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f1f5f9" }}>
                    { card.icon }
                  </div>
                </div>
              </motion.div>
            ) )
          }
        </div>
        <div className="mt-8">
          <AdminTitle text1="Active" text2="Shows" />
          <div className="space-y-4">
            { stats.activeShows.map( ( show, idx ) => (
              <motion.div key={ idx } initial={ { opacity: 0, x: -8 } } animate={ { opacity: 1, x: 0 } } transition={ { delay: idx * 0.06 } } className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-md">
                <div className="flex items-center gap-4">
                  <img src={ show.movie.poster_path } alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1">
                    <p className="font-medium truncate">{ show.movie.title }</p>
                    <p className="text-sm text-gray-500">{ formatDate( show.showDateTime ) }</p>
                  </div>
                </div>
                <p className="text-primary font-medium">{ currency } { show.showPrice }</p>
              </motion.div>
            ) ) }
          </div>
        </div>
      </>
    ) : (
      <DashboardSkeleton />
    )
}
