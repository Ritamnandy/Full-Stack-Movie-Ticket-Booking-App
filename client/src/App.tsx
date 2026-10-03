import { Route, Routes, useLocation } from "react-router-dom"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import MovieDetails from "./pages/MovieDetails"
import Movies from "./pages/Movies"
import SeatLayout from "./pages/SeatLayout"
import MyBooking from "./pages/MyBooking"
import Favorite from "./pages/Favorite"
import Footer from "./components/Footer"
import { Toaster } from "react-hot-toast"
import CustomCursor from "./components/CustomCursor"



export default function App ()
{

  const location = useLocation()
  const isAdminRoutes = location.pathname.startsWith( "/admin" );



  return (
    <MotionConfig reducedMotion="user">
      <Toaster />
      { !isAdminRoutes && <Navbar /> }
      <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
      <Routes location={location}>
        <Route path="/" element={ <Home /> } />
        <Route path="/movies" element={ <Movies /> } />
        <Route path="/movie/:id" element={ <MovieDetails /> } />
        <Route path="/movie/:id/booking/:date" element={ <SeatLayout /> } />
        <Route path="/my-bookings" element={ <MyBooking /> } />
        <Route path="/favorite" element={ <Favorite /> } />
      </Routes>
      </motion.main>
      </AnimatePresence>
      { !isAdminRoutes && <Footer /> }

      <CustomCursor />
    </MotionConfig>
  )
}
