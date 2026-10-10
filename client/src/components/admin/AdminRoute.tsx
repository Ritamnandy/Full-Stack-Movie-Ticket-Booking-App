import { Navigate, Outlet, useLocation } from "react-router-dom";
import Forbidden from "../../pages/Forbidden";
// import { useAuth } from "../context/AuthContext"; // your auth hook

export default function AdminRoute ()
{
    // const { user, loading } = useAuth();
    const loading = false;
    const user = { role: "ADMIN" };
    const location = useLocation();

    // 1. Still checking who the user is
    if ( loading )
    {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/10 border-t-primary" />
            </div>
        );
    }

    // 2. Not logged in: go home and open the login modal
    if ( !user )
    {
        return (
            <Navigate
                to="/"
                replace
                state={ { openLogin: true, from: location.pathname } }
            />
        );
    }

    // 3. Logged in but not an admin
    if ( user.role !== "ADMIN" )
    {
        return <Forbidden />;
    }

    // 4. Admin: render the nested admin routes
    return <Outlet />;
}