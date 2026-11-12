import { useEffect, useState } from "react"
import { dummyShowsData, type DummyShow } from "../../assets/assets"
import AdminTitle from "../../components/admin/AdminTitle"
import ListShowsSkeleton from "../../components/subComponents/ListShowsSkeleton"
import { motion } from "motion/react"
import { api } from "../../config/api.config"

type setMovieType = {
  movie: DummyShow,
  showDateTime: string,
  showPrice: number,
  occupiedSeats: Record<string, string>,
}

export default function ListShow ()
{

  const currency = import.meta.env.VITE_CURRENCY as string;

  const [ shows, setShows ] = useState<setMovieType[]>( [] );
  const [ loading, setLoading ] = useState<boolean>( true );

  const loadShows = async () =>
  {
    try
    {
      const data = await api( "/admin/shows" )
      const parsed: setMovieType[] = (data.data ?? []).map( ( s: any ) => ({
        movie: s.movie || { _id: "", title: "", backdrop_path: "", vote_average: 0, genres: [], runtime: 0, release_date: "" },
        showDateTime: s.showDateTime || "",
        showPrice: s.showPrice || 0,
        occupiedSeats: s.occupiedSeats || {},
      } ) )
      setShows( parsed )
      setLoading( false )
    } catch ( err )
    {
      console.error( 'Error fetching shows:', err )
      setLoading( false )
    }
  }

  useEffect( () => {
    loadShows()
  }, [] )

  return !loading ? (
    <>
      <AdminTitle text1="List" text2="Shows" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Price</th>
              <th className="p-2 font-medium">Occupied Seats</th>
              <th className="p-2 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            { shows.map( ( show, index ) => (
              <motion.tr key={ index } initial={ { opacity: 0, x: -8 } } animate={ { opacity: 1, x: 0 } } transition={ { delay: index * 0.06 } } className="border-b border-gray-200">
                <td className="p-2 pl-5">{ show.movie.title }</td>
                <td className="p-2">{ new Date( show.showDateTime ).toLocaleString() }</td>
                <td className="p-2">{ currency } { show.showPrice }</td>
                <td className="p-2">{ Object.keys( show.occupiedSeats ).length }</td>
                <td className="p-2">
                  <button className="text-primary hover:text-primary/80 text-sm underline">Details</button>
                  <button className="text-red-500 hover:text-red-800 text-sm underline">Delete</button>
                </td>
              </motion.tr>
            ) )}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <ListShowsSkeleton />
  )
}
