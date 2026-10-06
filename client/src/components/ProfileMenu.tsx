import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Heart, LayoutDashboard, LogOut, TicketPlus, UserRound } from "lucide-react";

export type AppUser = {
    name: string;
    email: string;
    avatar?: string | null;
    isAdmin?: boolean;
};

type ProfileMenuProps = {
    user: AppUser;
    onLogout: () => void | Promise<void>;
};

const getInitials = ( name: string ) =>
    name
        .trim()
        .split( /\s+/ )
        .slice( 0, 2 )
        .map( ( part ) => part[ 0 ]?.toUpperCase() ?? "" )
        .join( "" ) || "U";

function Avatar ( { user, size }: { user: AppUser; size: string } )
{
    const [ broken, setBroken ] = useState( false );

    if ( user.avatar && !broken )
    {
        return (
            <img
                src={ user.avatar }
                alt={ user.name }
                referrerPolicy="no-referrer"
                onError={ () => setBroken( true ) }
                className={ `${ size } rounded-full object-cover` }
            />
        );
    }

    return (
        <div
            className={ `${ size } flex items-center justify-center rounded-full bg-linear-to-br from-primary to-pink-500 text-xs font-semibold text-white` }
        >
            { getInitials( user.name ) }
        </div>
    );
}

export default function ProfileMenu ( { user, onLogout }: ProfileMenuProps )
{
    const navigate = useNavigate();
    const [ open, setOpen ] = useState( false );
    const [ loggingOut, setLoggingOut ] = useState( false );
    const wrapperRef = useRef<HTMLDivElement>( null );

    // Close on outside click + Esc
    useEffect( () =>
    {
        if ( !open ) return;

        const onPointerDown = ( e: MouseEvent ) =>
        {
            if ( !wrapperRef.current?.contains( e.target as Node ) ) setOpen( false );
        };
        const onKey = ( e: KeyboardEvent ) => e.key === "Escape" && setOpen( false );

        document.addEventListener( "mousedown", onPointerDown );
        window.addEventListener( "keydown", onKey );
        return () =>
        {
            document.removeEventListener( "mousedown", onPointerDown );
            window.removeEventListener( "keydown", onKey );
        };
    }, [ open ] );

    const go = ( path: string ) =>
    {
        setOpen( false );
        navigate( path );
        window.scrollTo( 0, 0 );
    };

    const handleLogout = async () =>
    {
        try
        {
            setLoggingOut( true );
            await onLogout();
        } finally
        {
            setLoggingOut( false );
            setOpen( false );
        }
    };

    const itemClass =
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer";

    return (
        <div ref={ wrapperRef } className="relative">
            {/* Trigger */ }
            <button
                type="button"
                onClick={ () => setOpen( ( o ) => !o ) }
                aria-haspopup="menu"
                aria-expanded={ open }
                aria-label="Open profile menu"
                className={ `flex items-center gap-2 rounded-full p-1 pr-2 border transition cursor-pointer ${ open
                    ? "border-primary/60 bg-primary/10 ring-4 ring-primary/15"
                    : "border-white/15 bg-white/5 hover:bg-white/10"
                    }` }
            >
                <Avatar user={ user } size="h-9 w-9" />
                <ChevronDown
                    className={ `w-4 h-4 text-gray-400 transition-transform duration-200 ${ open ? "rotate-180" : ""
                        }` }
                />
            </button>

            {/* Dropdown */ }
            { open && (
                <div
                    role="menu"
                    className="animate-card-in absolute right-0 top-full mt-3 w-72 origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-primary/10 backdrop-blur-md z-50"
                >
                    <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/25 blur-[70px]" />
                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent" />

                    {/* Profile header */ }
                    <div className="relative flex items-center gap-3 px-4 pt-5 pb-4">
                        <div className="rounded-full p-0.5 bg-linear-to-br from-primary to-pink-500">
                            <div className="rounded-full bg-slate-950 p-0.5">
                                <Avatar user={ user } size="h-12 w-12" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{ user.name }</p>
                            <p className="truncate text-xs text-gray-400">{ user.email }</p>
                            { user.isAdmin && (
                                <span className="mt-1.5 inline-block rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                                    Admin
                                </span>
                            ) }
                        </div>
                    </div>

                    <div className="mx-4 h-px bg-white/10" />

                    {/* Links */ }
                    <div className="relative p-2">
                        <button role="menuitem" onClick={ () => go( "/profile" ) } className={ itemClass }>
                            <UserRound className="w-4 h-4" />
                            My Profile
                        </button>
                        {!user.isAdmin && (<button role="menuitem" onClick={ () => go( "/my-bookings" ) } className={ itemClass }>
                            <TicketPlus className="w-4 h-4" />
                            My Bookings
                        </button>)}
                        { !user.isAdmin && ( <button role="menuitem" onClick={ () => go( "/favorite" ) } className={ itemClass }>
                            <Heart className="w-4 h-4" />
                            Favorites
                        </button> ) }
                        { user.isAdmin && (
                            <button role="menuitem" onClick={ () => go( "/admin" ) } className={ itemClass }>
                                <LayoutDashboard className="w-4 h-4" />
                                Admin Dashboard
                            </button>
                        ) }
                    </div>

                    <div className="mx-4 h-px bg-white/10" />

                    {/* Logout */ }
                    <div className="relative p-2">
                        <button
                            role="menuitem"
                            onClick={ handleLogout }
                            disabled={ loggingOut }
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60 transition cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            { loggingOut ? "Signing out..." : "Sign out" }
                        </button>
                    </div>
                </div>
            ) }
        </div>
    );
}