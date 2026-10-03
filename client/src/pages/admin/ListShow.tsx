import { useEffect, useState } from "react";
import { dummyShowsData, type DummyShow } from "../../assets/assets";
import AdminTitle from "../../components/admin/AdminTitle";
import ListShowsSkeleton from "../../components/subComponents/ListShowsSkeleton";

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

  const getAllShows = async () =>
  {
    try
    {
      setShows( [ {
        movie: dummyShowsData[ 0 ],
        showDateTime: "2025-07-27T01:00:00.000Z",
        showPrice: 59,
        occupiedSeats: {
          A1: "user_1",
          B1: "user_2",
          C1: "user_3",
        },
      } ] )
      setLoading( false );
    } catch ( error )
    {
      console.error( 'Error fetching shows:', error );
      setLoading( false );
    }
  }

  useEffect( () =>
  {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAllShows();
  }, [] )


  return !loading ? (
    <>

      <AdminTitle text1="List" text2="Shows" />
      <div className="max-w-4xl mt-6 overflow-x-auto">

        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Total Bookings</th>
              <th className="p-2 font-medium">Earning</th>
            </tr>
          </thead>

          <tbody>
            {shows.map( ( show, index ) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-2 pl-5">{show.movie.title}</td>
                <td className="p-2">{new Date( show.showDateTime ).toLocaleString()}</td>
                <td className="p-2">{Object.keys( show.occupiedSeats ).length}</td>
                <td className="p-2">{ currency }{Object.keys( show.occupiedSeats ).length * show.showPrice} </td>
              </tr>
            ) )}
          </tbody>

        </table>



      </div>
    </>
  ) : (
      <ListShowsSkeleton/>
  )
}
