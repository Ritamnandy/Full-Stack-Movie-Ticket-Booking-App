import { useEffect, useState } from "react";
import { dummyBookingData, type BookingType } from "../../assets/assets";
import AdminTitle from "../../components/admin/AdminTitle";
import ListBookingsSkeleton from "../../components/subComponents/ListBookingsSkeleton";
import { motion } from "motion/react";


export default function ListBooking ()
{
  const currency = import.meta.env.VITE_CURRENCY as string;

  const [ loading, setLoading ] = useState( true );
  const [ booking, setBookings ] = useState<BookingType[]>( [] )


  const getAllBookingData = () =>
  {
    setBookings( dummyBookingData )
    setLoading( false )
  }

  useEffect( () =>
  {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAllBookingData()
  }, [] )



  return !loading ? (
    <>
      <AdminTitle text1="List" text2="Bookings" />
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
            { booking.map( ( book, index ) => (
              <motion.tr key={ index } initial={ { opacity: 0, x: -8 } } animate={ { opacity: 1, x: 0 } } transition={ { delay: index * 0.06 } } className="border-b border-gray-200">
                <td className="p-2 pl-5">{ book.user.name }</td>
                <td className="p-2">{ book.show.movie.title }</td>
                <td className="p-2">{ new Date( book.show.showDateTime ).toLocaleString() }</td>
                <td className="p-2">{ book.bookedSeats.length }</td>
                <td className="p-2">{ currency } { book.amount }</td>
              </motion.tr>
            ) ) }
          </tbody>
        </table>
      </div>
    </>
  ) : (
      <ListBookingsSkeleton />
  )
}
