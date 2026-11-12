import { useEffect, useState } from "react";
import { api } from "../config/api.config";
import { Heart, } from "lucide-react";

export default function Favorite ()
{
    const [ isFavorite, setIsFavorite ] = useState( false )

    const toggleFavorite = async ( movieId: string ) =>
    {
        try
        {
            const data = await api( "/favorites/" + movieId, { method: "POST" } )
            setIsFavorite( data.data?.isFavorite ?? false )
            if ( data.data?.isFavorite )
            {
                toast( "Added to favorites" )
            } else
            {
                toast( "Removed from favorites" )
            }
        } catch ( err )
        {
            console.error( 'Error toggling favorite:', err )
            toast( 'Failed to update favorite' )
        }
    }

    useEffect( () =>
    {
        // TODO: load current user's favorites on mount
    }, [] )

    return (
        <div className="px-6 md:px-16 lg:px-40 py-32 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
            <p className="text-gray-600 mb-8">Your selected movies</p>
            <button
                onClick={ () => toggleFavorite( "demo-movie-id" ) }
                className="bg-primary text-white px-6 py-3 rounded hover:bg-primary/90 transition font-medium cursor-pointer"
            >
                Toggle Favorite
            </button>
        </div>
    )
}
