import type { Request, Response } from "express";
import { asyncHandler } from "../util/asyncHandler";
import { ApiError } from "../util/apiError";
import { ApiResponse } from "../util/apiResponse";
import type { AuthRequest } from "../types/auth.types";
import { Movie } from "../models/movie.models";
import { Show } from "../models/show.models";
import { Booking } from "../models/booking.models";
import { Favorite } from "../models/favorite.models";
import { User } from "../models/user.models";

const withId = ( doc: any ) =>
{
    const o = doc.toObject ? doc.toObject() : doc
    return { ...o, id: o._id.toString(), _id: o._id.toString() }
}

const uid = ( req: Request ) => ( req as AuthRequest ).user!._id.toString()

// ---------- movies ----------
export const listMovies = asyncHandler( async ( req: Request, res: Response ) =>
{
    // only movies that have at least one upcoming show
    const movieIds = await Show.distinct( "movie", { showDateTime: { $gte: new Date() } } )
    const movies = await Movie.find( { _id: { $in: movieIds } } ).sort( { createdAt: -1 } )
    return res.status( 200 ).json( ApiResponse.ok( "Movies fetched", movies.map( withId ) ) )
} )

export const listAllMovies = asyncHandler( async ( req: Request, res: Response ) =>
{
    const movies = await Movie.find().sort( { createdAt: -1 } )
    return res.status( 200 ).json( ApiResponse.ok( "Movies fetched", movies.map( withId ) ) )
} )

export const addMovie = asyncHandler( async ( req: Request, res: Response ) =>
{
    const movie = await Movie.create( req.body )
    return res.status( 201 ).json( ApiResponse.created( "Movie added", withId( movie ) ) )
} )

export const getMovie = asyncHandler( async ( req: Request, res: Response ) =>
{
    const id = req.params.id as string
    const movie = await Movie.findById( id )
    if ( !movie ) throw ApiError.notFound( "Movie not found" )
    const shows = await Show.find( { movie: id, showDateTime: { $gte: new Date() } } ).sort( { showDateTime: 1 } )
    // group by date (YYYY-MM-DD) as the client expects
    const dateTime: Record<string, { time: string; showId: string }[]> = {}
    for ( const s of shows )
    {
        const iso = s.showDateTime.toISOString()
        const date = iso.split( "T" )[ 0 ] as string
        ;( dateTime[ date ] ??= [] ).push( { time: iso, showId: s._id.toString() } )
    }
    return res.status( 200 ).json( ApiResponse.ok( "Movie fetched", { movie: withId( movie ), dateTime } ) )
} )

// ---------- shows ----------
export const addShow = asyncHandler( async ( req: Request, res: Response ) =>
{
    const { movieId, showPrice, showsInput } = req.body as {
        movieId: string; showPrice: number; showsInput: { date: string; time: string[] }[]
    }
    if ( !( await Movie.exists( { _id: movieId } ) ) ) throw ApiError.notFound( "Movie not found" )
    const docs = showsInput.flatMap( ( { date, time } ) =>
        time.map( ( t ) => ( { movie: movieId, showDateTime: new Date( `${ date }T${ t }:00` ), showPrice } ) ) )
    // unique index (movie, showDateTime) -> skip duplicates
    await Show.insertMany( docs, { ordered: false } ).catch( ( e ) =>
    {
        if ( e?.code !== 11000 && !e?.writeErrors?.every( ( w: any ) => w.err?.code === 11000 ) ) throw e
    } )
    return res.status( 201 ).json( ApiResponse.created( "Show added", {} ) )
} )

export const listShows = asyncHandler( async ( req: Request, res: Response ) =>
{
    const shows = await Show.find( { showDateTime: { $gte: new Date() } } ).populate( "movie" ).sort( { showDateTime: 1 } )
    return res.status( 200 ).json( ApiResponse.ok( "Shows fetched", shows.map( ( s ) =>
    {
        const o: any = s.toObject( { flattenMaps: true } )
        return { ...o, _id: o._id.toString(), movie: { ...o.movie, id: o.movie._id.toString(), _id: o.movie._id.toString() } }
    } ) ) )
} )

export const getOccupiedSeats = asyncHandler( async ( req: Request, res: Response ) =>
{
    const show = await Show.findById( req.params.id as string )
    if ( !show ) throw ApiError.notFound( "Show not found" )
    return res.status( 200 ).json( ApiResponse.ok( "Occupied seats", {
        occupiedSeats: Object.keys( show.occupiedSeats ? Object.fromEntries( show.occupiedSeats ) : {} ),
        showPrice: show.showPrice,
    } ) )
} )

// ---------- bookings ----------
export const createBooking = asyncHandler( async ( req: Request, res: Response ) =>
{
    const { showId, seats } = req.body as { showId: string; seats: string[] }
    const userId = uid( req )
    const unique = [ ...new Set( seats ) ]
    const show = await Show.findById( showId )
    if ( !show ) throw ApiError.notFound( "Show not found" )
    if ( show.showDateTime < new Date() ) throw ApiError.badRequest( "Show already started" )

    // atomic: only succeeds if none of the seats is taken yet
    const filter: Record<string, unknown> = { _id: showId }
    const set: Record<string, string> = {}
    for ( const s of unique )
    {
        filter[ `occupiedSeats.${ s }` ] = { $exists: false }
        set[ `occupiedSeats.${ s }` ] = userId
    }
    const result = await Show.updateOne( filter, { $set: set } )
    if ( result.modifiedCount === 0 ) throw ApiError.conflict( "Selected seats are already booked" )

    const booking = await Booking.create( {
        user: userId, show: showId, amount: show.showPrice * unique.length, bookedSeats: unique,
    } )
    return res.status( 201 ).json( ApiResponse.created( "Booking created", withId( booking ) ) )
} )

const populateBooking = ( q: any ) =>
    q.populate( "user", "name" ).populate( { path: "show", populate: { path: "movie" } } ).sort( { createdAt: -1 } )

const shapeBooking = ( b: any ) =>
{
    const o = b.toObject( { flattenMaps: true } )
    const show = o.show ? { ...o.show, _id: o.show._id.toString(), movie: o.show.movie ? { ...o.show.movie, id: o.show.movie._id.toString(), _id: o.show.movie._id.toString() } : o.show.movie } : o.show
    return { ...o, _id: o._id.toString(), show }
}

export const myBookings = asyncHandler( async ( req: Request, res: Response ) =>
{
    const bookings = await populateBooking( Booking.find( { user: uid( req ) } ) )
    return res.status( 200 ).json( ApiResponse.ok( "Bookings fetched", bookings.map( shapeBooking ) ) )
} )

export const payBooking = asyncHandler( async ( req: Request, res: Response ) =>
{
    // no payment gateway is integrated: this marks the booking as paid
    const booking = await Booking.findOneAndUpdate( { _id: req.params.id as string, user: uid( req ) }, { isPaid: true }, { new: true } )
    if ( !booking ) throw ApiError.notFound( "Booking not found" )
    return res.status( 200 ).json( ApiResponse.ok( "Booking paid", withId( booking ) ) )
} )

export const allBookings = asyncHandler( async ( req: Request, res: Response ) =>
{
    const bookings = await populateBooking( Booking.find() )
    return res.status( 200 ).json( ApiResponse.ok( "Bookings fetched", bookings.map( shapeBooking ) ) )
} )

// ---------- favorites ----------
export const toggleFavorite = asyncHandler( async ( req: Request, res: Response ) =>
{
    const movie = req.params.id as string
    const user = uid( req )
    const removed = await Favorite.findOneAndDelete( { user, movie } )
    if ( !removed )
    {
        if ( !( await Movie.exists( { _id: movie } ) ) ) throw ApiError.notFound( "Movie not found" )
        await Favorite.create( { user, movie } )
    }
    return res.status( 200 ).json( ApiResponse.ok( removed ? "Removed from favorites" : "Added to favorites", { isFavorite: !removed } ) )
} )

export const listFavorites = asyncHandler( async ( req: Request, res: Response ) =>
{
    const favs = await Favorite.find( { user: uid( req ) } ).populate( "movie" ).sort( { createdAt: -1 } )
    return res.status( 200 ).json( ApiResponse.ok( "Favorites fetched", favs.filter( ( f ) => f.movie ).map( ( f ) => withId( f.movie ) ) ) )
} )

// ---------- admin dashboard ----------
export const dashboard = asyncHandler( async ( req: Request, res: Response ) =>
{
    const [ paid, totalUser, activeShows ] = await Promise.all( [
        Booking.find( { isPaid: true } ).select( "amount" ),
        User.countDocuments(),
        Show.find( { showDateTime: { $gte: new Date() } } ).populate( "movie" ).sort( { showDateTime: 1 } ),
    ] )
    const totalBookings = await Booking.countDocuments()
    return res.status( 200 ).json( ApiResponse.ok( "Dashboard", {
        totalBookings,
        totalRevenue: paid.reduce( ( a, b ) => a + b.amount, 0 ),
        totalUser,
        activeShows: activeShows.map( ( s ) =>
        {
            const o: any = s.toObject( { flattenMaps: true } )
            return { ...o, _id: o._id.toString(), movie: { ...o.movie, id: o.movie._id.toString(), _id: o.movie._id.toString() } }
        } ),
    } ) )
} )
