import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
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
import LayOut from "./pages/admin/LayOut"
import DashBoard from "./pages/admin/DashBoard"
import AddShow from "./pages/admin/AddShow"
import ListShow from "./pages/admin/ListShow"
import ListBooking from "./pages/admin/ListBooking"
import ResetPassword from "./components/ResetPasswordPage"
import MyProfile from "./pages/MyProfile"
import GoogleSuccess from "./pages/GoogleSuccess"
import GoogleError from "./pages/GoogleError"
import NotFound from "./pages/NotFound"
import AdminRoute from "./components/admin/AdminRoute"
import { useAuth } from "./hooks/useAuth"



export default function App ()
{
  const nevigate = useNavigate()
  const location = useLocation()
  const { user, isAdmin, setProfileData, setProfileImage, deleteUserPermanently } = useAuth()
  const hideLayout =
    location.pathname.startsWith( "/admin" ) ||
    location.pathname.startsWith( "/reset-password" )


  return (
    <MotionConfig reducedMotion="user">
      <Toaster />
      { !hideLayout && <Navbar /> }
      <AnimatePresence mode="wait">
        <motion.main
          key={ location.pathname }
          initial={ { opacity: 0, y: 10 } }
          animate={ { opacity: 1, y: 0 } }
          exit={ { opacity: 0, y: -8 } }
          transition={ { duration: 0.28, ease: "easeOut" } }
        >
          <Routes location={ location }>
            <Route path="/" element={ <Home /> } />
            <Route path="/movies" element={ <Movies /> } />
            <Route path="/movie/:id" element={ <MovieDetails /> } />
            <Route path="/movie/:id/booking/:date" element={ <SeatLayout /> } />
            <Route path="/my-bookings" element={ <MyBooking /> } />
            <Route path="/favorite" element={ <Favorite /> } />
            <Route path="/reset-password" element={ <ResetPassword /> } />
            <Route path="/google/success" element={ <GoogleSuccess /> } />
            <Route path="/google/error" element={ <GoogleError /> } />
            <Route
              path="/profile"
              element={
                <MyProfile
                  user={ {
                    name: user?.name ?? "",
                    email: user?.email ?? "",
                    avatar: user?.avatar ?? "",
                    isAdmin: isAdmin,
                  } }
                  hasPassword={ false }
                  bookingsCount={ 2 }
                  favoritesCount={ 5 }
                  onSaveProfile={ async ( { name } ) =>
                  {
                    await setProfileData( { name } )
                  } }
                  onSaveAvatar={ async ( file ) =>
                  {
                    await setProfileImage( file )
                  } }
                  onChangePassword={ async ( { currentPassword, newPassword } ) =>
                  {
                    console.log( currentPassword, newPassword );

                  } }
                  onDeleteAccount={ async () =>
                  {
                    await deleteUserPermanently()
                    nevigate( '/' )
                    scrollTo( 0, 0 )
                  } }
                />
              }
            />
            <Route element={ <AdminRoute /> }>
              <Route path="/admin" element={ <LayOut /> }>
                <Route index element={ <DashBoard /> } />
                <Route path="add-shows" element={ <AddShow /> } />
                <Route path="list-shows" element={ <ListShow /> } />
                <Route path="list-bookings" element={ <ListBooking /> } />
              </Route>
            </Route>
            {/* Keep this LAST: any other URL */ }
            <Route path="*" element={ <NotFound /> } />
          </Routes>
        </motion.main>
      </AnimatePresence>
      { !hideLayout && <Footer /> }

      <CustomCursor />
    </MotionConfig>
  )
}
