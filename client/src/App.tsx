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
import LayOut from "./pages/admin/LayOut"
import DashBoard from "./pages/admin/DashBoard"
import AddShow from "./pages/admin/AddShow"
import ListShow from "./pages/admin/ListShow"
import ListBooking from "./pages/admin/ListBooking"
import ResetPassword from "./components/ResetPasswordPage"
import MyProfile from "./pages/MyProfile"



export default function App ()
{

  const location = useLocation()
  const isAdminRoutes = location.pathname.startsWith( "/admin" );
  const user = {
    fullName: "John Doe",
    username: "johndoe",
    email: "johndoe@example.com",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU8TFJ7iUwyhF0_LOmPpst5aFLBQUYvRcuREn63JTVvg&s=10",
    role: "user"

  }


  return (
    <MotionConfig reducedMotion="user">
      <Toaster />
      { !isAdminRoutes && <Navbar /> }
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
            <Route
              path="/profile"
              element={
                <MyProfile
                  user={ {
                    name: user.fullName,
                    email: user.email,
                    avatar: user.imageUrl,
                    isAdmin: user.role === "admin",
                  } }
                  hasPassword={ false }
                  bookingsCount={ 2 }
                  favoritesCount={ 5 }
                  onSaveProfile={ async ( { name, avatarFile } ) =>
                  {
                    // const form = new FormData();
                    // form.append("name", name); form.append("phone", phone);
                    // if (avatarFile) form.append("avatar", avatarFile);
                    // await api.put("/user/profile", form);
                  } }
                  onChangePassword={ async ( { currentPassword, newPassword } ) =>
                  {
                    // await api.put("/user/password", { currentPassword, newPassword });
                    // throw new Error("Current password is incorrect") on failure
                  } }
                  onDeleteAccount={ async () =>
                  {
                    // await api.delete("/user");
                    // clear auth state, then navigate("/")
                  } }
                />
              }
            />
            <Route path="/admin/*" element={ <LayOut /> } >
            
              <Route index element={ <DashBoard /> } />
              <Route path="add-shows" element={ <AddShow /> } />
              <Route path="list-shows" element={ <ListShow /> } />
              <Route path="list-bookings" element={ <ListBooking /> } />

            </Route>

          </Routes>
        </motion.main>
      </AnimatePresence>
      { !isAdminRoutes && <Footer /> }

      <CustomCursor />
    </MotionConfig>
  )
}
