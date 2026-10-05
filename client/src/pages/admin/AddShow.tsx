import { useEffect, useState } from "react"
import { dummyShowsData, type DummyShow } from "../../assets/assets"
import AdminTitle from "../../components/admin/AdminTitle"
import { CheckIcon, StarIcon, XIcon } from "lucide-react"
import { KConverter } from "../../lib/Kconverter"


export default function AddShow ()
{

  const currency = import.meta.env.VITE_CURRENCY as string
  const [ nowPlayingMovies, setNowPlayingMovies ] = useState<DummyShow[]>( [] )

  const [ selectedMovie, setSelectedMovie ] = useState( "" )

  const [ dateTimeSelection, setDateTimeSelection ] = useState<Record<string, string[]>>( {} )

  const [ dateTimeInput, setDateTimeInput ] = useState( "" )

  const [ showPrice, setShowPrice ] = useState( "" )

  const handleDateTimeAdd = () =>
  { 
    if(!dateTimeInput) return;
    const [ date, Time ] = dateTimeInput.split( "T" );
    if ( !date || !Time ) return;
    setDateTimeSelection( ( prev ) =>
    {
      const times = prev[ date ] || [];
      if ( !times.includes( Time ) )
      {
        return {
          ...prev,
          [date]: [...times, Time]
        }
      };
      return prev;
    })
    
  }

  const handleRemoveTime = ( date: string, time: string ) =>
  {
    setDateTimeSelection( ( prev ) =>
    {
      const filteredTimes = ( prev[ date ] || [] ).filter( ( t ) => t !== time )

      // no times left -> remove the whole date
      if ( filteredTimes.length === 0 )
      {
        const updated = { ...prev }
        delete updated[ date ]
        return updated
      }

      return {
        ...prev,
        [ date ]: filteredTimes
      }
    } )
  }



  const fetchNowPlayingMovies = async () =>
  {
    setNowPlayingMovies( dummyShowsData )
  }
  useEffect( () =>
  {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNowPlayingMovies()
  }, [] )

  return nowPlayingMovies.length > 0 ? (
    <>
      <AdminTitle text1="Add" text2="Shows" />
      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {
            nowPlayingMovies.map( ( movie ) => (
              <div key={ movie.id } onClick={ () => setSelectedMovie( movie.id.toString() ) } className={ `relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300` }>
                <div className="relative rounded-lg overflow-hidden">
                  <img src={ movie.poster_path } alt="" className="w-full object-cover brightness-90 " />
                  <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                    <p className="flex items-center gap-1 text-gray-400">
                      <StarIcon className="w-4 h-4 text-primary fill-primary" />
                      { movie.vote_average.toFixed( 1 ) }
                    </p>
                    <p className="text-gray-300">{ KConverter( movie.vote_count ) } Votes</p>

                  </div>
                </div>
                {/* selected tint + badge */ }
                { selectedMovie === movie.id.toString() && (
                  <>
                    <div className="absolute inset-0 bg-primary/10" />
                    <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white shadow-md">
                      <CheckIcon className="w-4 h-4" strokeWidth={ 3 } />
                    </div>
                  </>
                ) }
                <p className="font-medium truncate">{ movie.title }</p>
                <p className="text-gray-400 text-sm">{ movie.release_date }</p>
              </div>
            ) )
          }
        </div>
      </div>
      {/* Show price input */ }
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">
            { currency }
          </p>
          <input min={ 0 } type="number" value={ showPrice } onChange={ ( e ) => setShowPrice( e.target.value ) } placeholder="Enter show price" className="outline-none" />
        </div>
      </div>
      {/* Date & Time Selection */ }
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Select Date and Time</label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input type="datetime-local" value={ dateTimeInput } onChange={ ( e ) => setDateTimeInput( e.target.value ) } className="outline-none rounded-md" />
          <button onClick={ handleDateTimeAdd } className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer">
            Add Time
          </button>
        </div>
      </div>
      {/* display selected time */ }
      { Object.keys( dateTimeSelection ).length > 0 && (
        <div className="mt-6 mb-6">
          <h2 className="mb-2 text-sm font-medium">Selected Date-Time</h2>
          <ul className="space-y-3">
            { Object.entries( dateTimeSelection ).map( ( [ date, times ] ) => (
              <li key={ date }>
                <div className="font-medium">{ date }</div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  { times.map( ( time ) => (
                    <div
                      key={ time }
                      className="border border-primary px-2 py-1 flex items-center rounded"
                    >
                      <span>{ time }</span>
                      <XIcon
                        onClick={ () => handleRemoveTime( date, time ) }
                        width={ 15 }
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      />
                    </div>
                  ) ) }
                </div>
              </li>
            ) ) }
          </ul>
        </div>
      ) }
      <button className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer">Add Show</button>
    </>
  ) : <>
    <AdminTitle text1="Add" text2="Shows" />
    <div className="flex items-center gap-3 mt-10" role="status" aria-live="polite">
      <div className="w-5 h-5 rounded-full border-2 border-gray-600 border-t-primary animate-spin" />
      <p className="text-lg font-medium text-gray-300">Loading now playing movies...</p>
    </div>

    <div className="flex flex-wrap gap-4 mt-6">
      { Array.from( { length: 6 } ).map( ( _, i ) => (
        <div key={ i } className="w-40 animate-pulse">
          <div className="h-60 rounded-lg bg-gray-700/50" />
          <div className="h-4 w-3/4 mt-2 rounded bg-gray-700/50" />
          <div className="h-3 w-1/2 mt-2 rounded bg-gray-700/50" />
        </div>
      ) ) }
    </div>
  </>
}
