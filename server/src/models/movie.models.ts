import mongoose, { Schema } from "mongoose";

const movieSchema = new Schema( {
    title: { type: String, required: true, trim: true },
    overview: { type: String, default: "" },
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, required: true },
    release_date: { type: String, required: true },
    runtime: { type: Number, required: true },
    genres: [ { id: Number, name: String, _id: false } ],
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 },
    original_language: { type: String, default: "en" },
    tagline: { type: String, default: "" },
    casts: [ { name: String, profile_path: String, _id: false } ],
}, { timestamps: true } )

export const Movie = mongoose.model( "Movie", movieSchema )
