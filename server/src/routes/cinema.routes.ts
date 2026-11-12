import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middlewares"
import { adminOnly } from "../middlewares/admin.middlewares"
import { validate } from "../middlewares/validate.middlewares"
import { cinemaValidators } from "../validators/cinema.validators"
import * as c from "../controllers/cinema.controller"

const router = Router()

// public
router.get( "/movies", c.listMovies )
router.get( "/movies/:id", validate( cinemaValidators.idParam, "params" ), c.getMovie )
router.get( "/shows/:id/seats", validate( cinemaValidators.idParam, "params" ), c.getOccupiedSeats )

// user
router.post( "/bookings", verifyJwt, validate( cinemaValidators.createBooking ), c.createBooking )
router.get( "/bookings/me", verifyJwt, c.myBookings )
router.patch( "/bookings/:id/pay", verifyJwt, validate( cinemaValidators.idParam, "params" ), c.payBooking )
router.get( "/favorites", verifyJwt, c.listFavorites )
router.post( "/favorites/:id", verifyJwt, validate( cinemaValidators.idParam, "params" ), c.toggleFavorite )

// admin
router.get( "/admin/dashboard", verifyJwt, adminOnly, c.dashboard )
router.get( "/admin/movies", verifyJwt, adminOnly, c.listAllMovies )
router.post( "/admin/movies", verifyJwt, adminOnly, validate( cinemaValidators.addMovie ), c.addMovie )
router.get( "/admin/shows", verifyJwt, adminOnly, c.listShows )
router.post( "/admin/shows", verifyJwt, adminOnly, validate( cinemaValidators.addShow ), c.addShow )
router.get( "/admin/bookings", verifyJwt, adminOnly, c.allBookings )

export default router
