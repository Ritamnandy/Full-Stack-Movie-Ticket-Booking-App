import { useEffect, useState } from "react"
import { dummyShowsData, type DummyShow } from "../../assets/assets"
import AdminTitle from "../../components/admin/AdminTitle"
import { CheckIcon, StarIcon, XIcon } from "lucide-react"
import { KConverter } from "../../lib/Kconverter"
import { api } from "../../config/api.config"

export default function AddShow ()
{

  const currency = import.meta.env.VITE_CURRENCY as string
  const [ nowPlayingMovies, setNowPlayingMovies ] = useState<DummyShow[]>( [] )
  const [ selectedMovie, setSelectedMovie ] = useState( "" )
  const [ dateTimeSelection, setDateTimeSelection ] = useState<Record<string, string[]>>( {} )
  const [ dateTimeInput, setDateTimeInput ] = useState( "" )
  const [ showPrice, setShowPrice ] = useState( "" )

  const loadNowPlaying = async () =>
  {
    try
    {
      const data = await api( "/admin/movies" )
      setNowPlayingMovies( data.data ?? [] )
    } catch ( err )
    {
      console.error( 'Error fetching movies:', err )
    }
  }

  useEffect( () => {
    loadNowPlaying()
  }, [] )

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
        };
      }
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
        const { [ date ]: removed, rest } = Object.entries( prev ).reduce<Record<string, string[]>>(
          ( acc, [ key, times ] ) => {
            if ( key === date ) {
              acc.push( [] );
            } else {
              acc.push( times );
            }
            return acc;
          },
          []
        );
        return { ...rest };
      }
      const newTimes = { ...prev[ date ]?.filter( ( t ) => t !== time ) || [] };
      return { ...prev, [ date ]: newTimes };
    })
  }

  const saveShow = async () =>
  {
    if ( !selectedMovie || Object.keys( dateTimeSelection ).length === 0 )
    {
      toast.error( 'Please select movie and showtimes' )
      return;
    }
    try
    {
      const data = await api( "/admin/shows", {
        method: "POST",
        body: {
          movieId: selectedMovie,
          showPrice: Number( showPrice ),
          showsInput: Object.entries( dateTimeSelection ).map( ( [ date, times ] ) => ({ date, time: times } ))
        }
      } )
      toast.success( data.data?.message ?? "Show added successfully" )
      setSelectedMovie( "" )
      setDateTimeSelection( {} )
      setShowPrice( "" )
      loadNowPlaying()
    } catch ( err )
    {
      console.error( 'Error saving show:', err )
      toast.error( 'Failed to add show' )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AdminTitle text1="Add" text2="Shows" />
        <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
        <div className="overflow-x-auto pb-4">
          <div className="group flex flex-wrap gap-4 mt-4 w-max">
            { nowPlayingMovies.map( ( movie ) => (
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
                { selectedMovie === movie.id.toString() && (
                  <>
                    <div className="absolute inset-0 bg-primary/10" />
                    <div className="absolute top-2 right-2 flex items-center justify-c">
                      <div className="flex items-center gap-2 px-2 py-1 bg-white/20 rounded text-xs font-medium">
                        <CheckIcon className="w-3 h-3 fill-white" /> Selected
                      </div>
                    </div>
                  </>
                ) }
              </div>
            ) }
          </div>
        </div>
        { selectedMovie && (
          <div className="mt-10 p-6 bg-white rounded-lg shadow-md">
            <p className="text-lg font-medium mb-4">Add New Show</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Show Price</label>
                <input
                  value={ showPrice }
                  onChange={ (e) => setShowPrice( e.target.value ) }
                  type="number"
                  min="1"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date & Time</label>
                <input
                  value={ dateTimeInput }
                  onChange={ (e) => setDateTimeInput( e.target.value ) }
                  type="datetime-local"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-center mt-20">
              <button onClick={ saveShow } className="px-10 py-3 text-sm bg-primary hover:bg-primary/90 transition rounded-md font-medium cursor-pointer">Save Show</button>
            </div>
          </div>
        ) }
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
      </div>
    </div>
  )
}
