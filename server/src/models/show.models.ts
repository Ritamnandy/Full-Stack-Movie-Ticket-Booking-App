import mongoose, { Schema } from "mongoose";

const showSchema = new Schema( {
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true, index: true },
    showDateTime: { type: Date, required: true, index: true },
    showPrice: { type: Number, required: true, min: 0 },
    // seatId -> userId
    occupiedSeats: { type: Map, of: String, default: {} },
}, { timestamps: true, minimize: false } )

showSchema.index( { movie: 1, showDateTime: 1 }, { unique: true } )

export const Show = mongoose.model( "Show", showSchema )
