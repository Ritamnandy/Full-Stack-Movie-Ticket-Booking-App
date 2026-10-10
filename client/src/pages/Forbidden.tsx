import { Link } from "react-router-dom";
import { Home, ShieldAlert } from "lucide-react";
import BlurCircle from "../components/BlurCircle";

export default function Forbidden ()
{
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
            <BlurCircle topValue="100px" leftValue="10%" />
            <BlurCircle bottomValue="40px" rightValue="10%" />

            <div className="animate-card-in relative flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/15">
                    <ShieldAlert className="h-8 w-8 text-red-400" />
                </div>
                <h1 className="mt-6 text-2xl font-bold">Access denied</h1>
                <p className="mt-2 max-w-sm text-sm text-gray-400">
                    You don't have permission to view this page. This area is for admins only.
                </p>
                <Link
                    to="/"
                    className="mt-7 flex h-12 items-center gap-2 rounded-full bg-linear-to-r from-primary to-pink-500 px-7 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition"
                >
                    <Home className="h-4 w-4" />
                    Back to home
                </Link>
            </div>
        </div>
    );
}