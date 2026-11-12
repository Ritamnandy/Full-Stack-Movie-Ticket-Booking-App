import { z } from "zod";

const objectId = z.string().regex( /^[a-f\d]{24}$/i, "Invalid id" )

export const cinemaValidators = {
    idParam: z.object( { id: objectId } ),
    addShow: z.object( {
        movieId: objectId,
        showPrice: z.coerce.number().positive(),
        showsInput: z.array( z.object( {
            date: z.string().regex( /^\d{4}-\d{2}-\d{2}$/ ),
            time: z.array( z.string().regex( /^\d{2}:\d{2}$/ ) ).min( 1 ),
        } ) ).min( 1 ),
    } ),
    createBooking: z.object( {
        showId: objectId,
        seats: z.array( z.string().regex( /^[A-J][1-9]$/ ) ).min( 1 ).max( 5 ),
    } ),
    addMovie: z.object( {
        title: z.string().trim().min( 1 ),
        overview: z.string().optional(),
        poster_path: z.string().url(),
        backdrop_path: z.string().url(),
        release_date: z.string().min( 4 ),
        runtime: z.coerce.number().positive(),
        genres: z.array( z.object( { id: z.number(), name: z.string() } ) ).optional(),
        vote_average: z.coerce.number().optional(),
        vote_count: z.coerce.number().optional(),
        original_language: z.string().optional(),
        tagline: z.string().optional(),
        casts: z.array( z.object( { name: z.string(), profile_path: z.string() } ) ).optional(),
    } ),
}
