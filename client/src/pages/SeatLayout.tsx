import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { assets, dummyDateTimeData, dummyShowsData, type DummyShow, type Show, type ShowsByDate } from "../assets/assets"
import { ArrowRightIcon, ClockIcon } from "lucide-react"
import { isoTimeFormat } from "../lib/isoTimeFormat"
import BlurCircle from "../components/BlurCircle"
import toast from "react-hot-toast"
import { motion } from "motion/react"

type ShowType = {
    show: DummyShow,
    dateTime: ShowsByDate
}

type SelectSeat = string

export default function SeatLayout ()
{


    const groupRows = [ [ 'A', 'B' ], [ 'C', 'D' ], [ 'E', 'F' ], [ 'G', 'H' ], [ 'I', 'J' ] ]


    const { id, date } = useParams()
    const navigate = useNavigate()
    const [ selectedSeats, setSelectedSeats ] = useState<SelectSeat[]>( [] )
    const [ selectTime, setSelectTime ] = useState<Show | null>( null )
    const [ show, setShow ] = useState<ShowType | null>( null )

    const getShow = useCallback( async () =>
    {
        const response = dummyShowsData.find( ( show ) => show._id === id )
        if ( response )
        {
            setShow( {
                show: response,
                dateTime: dummyDateTimeData
            } )
        }
    }, [ id ] )
    const handleSeatClick = ( id: string ) =>
    {
        if ( !selectTime )
        {
            toast.error( 'Please select  time first' )
            return
        }
        if ( !selectedSeats.includes( id ) && selectedSeats.length > 4 )
        {
            toast( 'You can select maximum 5 seats' )
            return
        }
        setSelectedSeats( prev => prev.includes( id ) ? prev.filter( seat => seat !== id ) : [ ...prev, id ] )
    }

    const renderSeats = ( row: string, count: number = 9 ) =>
    (
        <div key={ row } className="flex gap-2 mt-2">

            {
                Array.from( { length: count } ).map( ( _, index ) =>
                {
                    const seatId = `${ row }${ index + 1 }`
                    return (
                        <motion.button
                            onClick={ () => handleSeatClick( seatId ) }
                            key={ seatId } whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} animate={{ scale: selectedSeats.includes( seatId ) ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 420, damping: 18 }} className={ `h-8 w-8 rounded border border-primary/60 cursor-pointer ${ selectedSeats.includes( seatId ) && 'bg-primary text-white' }` }>
                            { seatId }
                        </motion.button>
                    )
                } )
            }
        </div>
    )

    useEffect( () =>
    {
        // The local mock data is loaded on route changes; production data will be async.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getShow();
    }, [ getShow ] );



    return show ? (
        <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
            {/* Avilable Timings */ }
            <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">

                <p className="text-lg font-semibold px-6">Available Timings</p>
                <div className="mt-5 space-y-1">
                    {
                        show.dateTime[ date || '' ]?.map( ( item ) => (
                            <div

                                onClick={ () => setSelectTime( item ) }

                                key={ item.showId }
                                className={ `flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${ selectTime?.time === item.time ? 'bg-primary text-white' : 'hover:bg-primary/20'
                                    }` }
                            >
                                <ClockIcon className="w-4 h-4" />
                                <p className="text-sm">{
                                    isoTimeFormat( item.time )
                                }</p>
                            </div>
                        ) )
                    }
                </div>

            </div>

            {/* Seats Layout */ }
            <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
                <BlurCircle topValue="-100px" leftValue="-100px" />
                <BlurCircle bottomValue="0px" rightValue="0px" />
                <h1 className="text-2xl font-semibold mb-4">Select Your Seat</h1>
                <img src={ assets.screenImage } alt="Screen" />
                <p className="text-sm text-gray-400 mb-6">SCREEN SIDE</p>
                <div className="flex flex-col items-center mt-10 text-sm text-gray-300">

                    <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
                        {
                            groupRows[ 0 ].map( row => renderSeats( row ) )
                        }
                    </div>

                    <div className="grid grid-cols-2 gap-11">

                        {
                            groupRows.slice( 1 ).map( ( row, index ) => (
                                <div key={ index } >
                                    { row.map( r => renderSeats( r ) ) }
                                </div>
                            ) )
                        }

                    </div>

                </div>


                <button

                    onClick={ () =>
                    {
                        if ( selectedSeats.length > 4 )
                        {
                            navigate( '/my-bookings' );
                        } else
                        {
                            toast.error( 'Please select seat first' );
                        }
                    } }
                    className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95">
                    Proceed to checkout
                    <ArrowRightIcon strokeWidth={ 3 } className="w-4 h-4" />
                </button>


            </div>

        </div>
    ) : (
        <div>Loading...</div>
    )
}
