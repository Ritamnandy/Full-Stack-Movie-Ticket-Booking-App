import { StarIcon } from "lucide-react"
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react";

type Genres = {
    id: number;
    name: string;
}
type Props = {
    movie: {
        image: string
        id: string
        title: string
        releaseDate: string
        genres: Genres[]
        runTime: string
        rating: number
    }
}

const MovieCard = ( { movie }: Props ) =>
{
    const [ visible, setVisible ] = useState( false );
    const [ position, setPosition ] = useState( { x: 0, y: 0 } );

    const divRef = useRef<HTMLDivElement>( null );

    const handleMouseMove = ( e: React.MouseEvent<HTMLDivElement> ) =>
    {
        if ( !divRef.current ) return;

        const bounds = divRef.current.getBoundingClientRect();

        setPosition( {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        } );
    };

    const navigate = useNavigate();

    const timeInHours = Math.floor( parseInt( movie.runTime ) / 60 );
    const timeInMinutes = parseInt( movie.runTime ) % 60;

    return (
        <motion.article
            ref={ divRef }
            onMouseMove={ handleMouseMove }
            onMouseEnter={ () => setVisible( true ) }
            onMouseLeave={ () => setVisible( false ) }
            className="
        relative
        isolate
        flex
        flex-col
        justify-between
        p-3
        bg-gray-800
        rounded-2xl
        hover:-translate-y-1
        transition-transform
        duration-300
        w-66
        overflow-hidden
        cursor-pointer
      "
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -7 }}
        >
            { visible && (
                <div
                    className="
            pointer-events-none
            absolute
            size-40
            rounded-full
            bg-primary
            blur-3xl
            opacity-40
            transition-opacity
            duration-200
          "
                    style={ {
                        top: position.y - 80,
                        left: position.x - 80,
                    } }
                />
            ) }

            <img
                onClick={ () =>
                {
                    navigate( `/movie/${ movie.id }` );
                    scrollTo( 0, 0 );
                } }
                src={ movie.image }
                alt="Movie"
                className="
          relative
          z-10
          w-full
          h-52
          rounded-lg
          object-bottom-right
          object-cover
          cursor-pointer
        "
            />

            <p className="relative z-10 font-semibold mt-2 truncate">
                { movie.title }
            </p>

            <p className="relative z-10 text-sm text-gray-400 mt-2">
                { new Date( movie.releaseDate ).getFullYear() } .{ " " }
                { movie.genres
                    .slice( 0, 2 )
                    .map( ( genre ) => genre.name )
                    .join( " | " ) }{ " " }
                .{ " " }
                { timeInHours > 0
                    ? `${ timeInHours }h ${ timeInMinutes }m`
                    : `${ timeInMinutes }m` }
            </p>

            <div className="relative z-10 flex items-center justify-between mt-4 pb-3">
                <button
                    onClick={ () =>
                    {
                        navigate( `/movie/${ movie.id }` );
                        scrollTo( 0, 0 );
                    } }
                    className="
            px-4
            py-2
            text-xs
            bg-primary
            hover:bg-primary-dull
            transition
            rounded-full
            font-medium
            cursor-pointer
          "
                >
                    Buy Tickets
                </button>

                <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    { movie.rating.toFixed( 1 ) }
                </p>
            </div>
        </motion.article>
    );
};

export default MovieCard 
