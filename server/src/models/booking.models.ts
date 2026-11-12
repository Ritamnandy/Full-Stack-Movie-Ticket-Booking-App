import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema( {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    show: { type: Schema.Types.ObjectId, ref: "Show", required: true, index: true },
    amount: { type: Number, required: true },
    bookedSeats: { type: [ String ], required: true },
    isPaid: { type: Boolean, default: false },
}, { timestamps: true } )

export const Booking = mongoose.model( "Booking", bookingSchema )
