import { Link, NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";
import LoginBtn from "./subComponents/LoginBtn";
import { useEffect, useRef, useState } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import EmailVerifyModal from "./EmailVerifyModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import ProfileMenu from "./ProfileMenu";

const MenuLink = [
    { to: "/", label: "Home" },
    { to: "/movies", label: "Movies" },
    { to: "/theatres", label: "Theatres" },
    { to: "/releases", label: "Releases" },
    { to: "/favorite", label: "Favorite" },
]


export default function Navbar ()
{
    const [ isSearchOpen, setIsSearchOpen ] = useState( false );
    const [ isMenuOpen, setIsMenuOpen ] = useState( false );
    const [ authModal, setAuthModal ] = useState<"login" | "signup" | "verify" | "forgot" | null>( null );
    const [ verifyEmail, setVerifyEmail ] = useState( "" );
    const searchInputRef = useRef<HTMLInputElement>( null );
    const searchBarRef = useRef<HTMLDivElement>( null );
    const user = {
        fullName: "John Doe",
        username: "johndoe",
        email: "johndoe@example.com",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU8TFJ7iUwyhF0_LOmPpst5aFLBQUYvRcuREn63JTVvg&s=10",
        role: "user"

    }
    // const { openSignIn } = useClerk()
    const navigate = useNavigate()
    const [ searchValue, setSearchValue ] = useState( "" );

    const handleSearch = () =>
    {
        const query = searchValue.trim();
        if ( !query ) return;

        navigate( `/movies?search=${ encodeURIComponent( query ) }` );
        setIsSearchOpen( false );
        setSearchValue( "" );
        window.scrollTo( 0, 0 );
    };

    useEffect( () =>
    {
        if ( isSearchOpen )
        {
            searchInputRef.current?.focus();
        }
    }, [ isSearchOpen ] );

    useEffect( () =>
    {
        const handleClickOutside = ( event: MouseEvent ) =>
        {
            if (
                searchBarRef.current &&
                !searchBarRef.current.contains( event.target as Node )
            )
            {
                setIsSearchOpen( false );
            }
        };

        if ( isSearchOpen )
        {
            document.addEventListener( "mousedown", handleClickOutside );
        }

        return () =>
        {
            document.removeEventListener( "mousedown", handleClickOutside );
        };
    }, [ isSearchOpen ] );

    return (
        <div className="fixed top-0 left-0 w-full  z-50 flex items-center justify-between px-6 md:px-16 lg:px-36 py-5">
            <Link to='/' className="max-md:flex-1">
                <img src={ assets.logo } alt="App Logo" className="w-36 h-auto" />
            </Link>
            {/* menu items */ }
            <div className={ `max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen  md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/50 overflow-hidden transition-[width] duration-300 ${ isMenuOpen ? "max-md:w-full" : "max-md:w-0" }` } >
                <XIcon className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer" onClick={ () => setIsMenuOpen( false ) } />

                {
                    MenuLink.map( ( { to, label }, index ) => (
                        <NavLink
                            onClick={ () => { scrollTo( 0, 0 ); setIsMenuOpen( false ) } }
                            to={ to } key={ index } className={ ( { isActive } ) =>
                                `duration-200 ${ isActive && "text-primary border-b-2 border-primary" } border-gray-100   hover:text-primary-dull ` }>{ label }</NavLink>

                    ) )
                }

            </div>
            {/* login button & search button */ }
            <div className="flex items-center gap-8">
                <span
                    className="relative max-md:hidden flex items-center justify-center cursor-pointer"
                    onClick={ () => setIsSearchOpen( !isSearchOpen ) }
                >
                    {/* Ripple ring while searching */ }
                    { isSearchOpen && (
                        <span className="absolute inset-0 -m-1 rounded-full bg-primary/30 animate-ping" />
                    ) }

                    <SearchIcon
                        className={ `relative w-6 h-6 transition-colors duration-200 hover:text-primary ${ isSearchOpen ? "text-primary animate-search-scan" : "text-white"
                            }` }
                    />
                </span>
                {
                    !user ? (
                        <LoginBtn title="Login" onClick={ () => setAuthModal( 'login' ) } />
                    ) : (
                        <ProfileMenu
                            user={ {
                                email: user.email,
                                name: user.fullName,
                                avatar: user.imageUrl,
                                isAdmin: user.role === 'admin'
                            } }
                            onLogout={ async () =>
                            {
                                // await api.post("/auth/logout")
                                // clear your auth state here
                                navigate( "/" );
                            } }
                        />
                    )
                }
            </div>
            <MenuIcon className="cursor-pointer max-md:ml-4 md:hidden w-8 h-8  " onClick={ () => setIsMenuOpen( !isMenuOpen ) } />

            {
                isSearchOpen && (
                    <div
                        ref={ searchBarRef }
                        className="absolute top-20 right-52 md:right-30 w-88 rounded-full p-[1.5px]
                       bg-linear-to-r from-primary via-pink-500 to-primary
                       shadow-lg shadow-primary/20 transition-shadow duration-300
                       focus-within:shadow-primary/50 focus-within:shadow-2xl
                       animate-in fade-in slide-in-from-top-2"
                    >
                        <div className="flex items-center gap-3 h-12 px-4 rounded-full bg-slate-950/95 backdrop-blur-md">
                            {/* Search icon */ }
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={ 2 }
                                className="w-5 h-5 shrink-0 text-primary"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                            </svg>

                            <input
                                type="text"
                                value={ searchValue }
                                onChange={ ( e ) => setSearchValue( e.target.value ) }
                                onKeyDown={ ( e ) =>
                                {
                                    if ( e.key === "Enter" ) handleSearch();
                                    if ( e.key === "Escape" ) setIsSearchOpen( false );
                                } }
                                ref={ searchInputRef }
                                placeholder="Search movies, theatres..."
                                className="flex-1 h-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                            />

                            {/* Keyboard hint */ }
                            <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-md border border-white/15 bg-white/5 text-[10px] text-gray-400 font-sans">
                                Esc
                            </kbd>
                        </div>
                    </div>
                )
            }

            <LoginModal
                isOpen={ authModal === "login" }
                onClose={ () => setAuthModal( null ) }
                onSwitchToSignup={ () => setAuthModal( "signup" ) }
                onForgotPassword={ () => setAuthModal( "forgot" ) }
                onSubmit={ async ( data ) =>
                {
                    console.log( 'Login function called ', data );
                } }
            />

            <SignupModal
                isOpen={ authModal === "signup" }
                onClose={ () => setAuthModal( null ) }
                onSwitchToLogin={ () => setAuthModal( "login" ) }
                onSubmit={ async ( { name, email, password } ) =>
                {
                    console.log( 'Signup function called ', { name, email, password } );
                    setVerifyEmail( email );
                    setAuthModal( 'verify' );

                } }
            />

            <EmailVerifyModal
                isOpen={ authModal === "verify" }
                email={ verifyEmail }
                onClose={ () => setAuthModal( null ) }
                onChangeEmail={ () => setAuthModal( "signup" ) }
                onVerify={ async ( code ) =>
                {
                    setTimeout( () =>
                    {
                        console.log( code );
                        console.log( verifyEmail );

                        // setAuthModal( null );
                    }, 2000 );
                } }
                onResend={ async () =>
                {
                    // await api.post("/auth/resend-code", { email: verifyEmail })
                } }
            />

            <ForgotPasswordModal
                isOpen={ authModal === "forgot" }
                onClose={ () => setAuthModal( null ) }
                onBackToLogin={ () => setAuthModal( "login" ) }
                onSubmit={ async ( email ) =>
                {
                    console.log( 'Forgot password submitted with email:', email );

                } }
                onResend={ async ( email ) =>
                {
                    console.log( 'Resend code requested for email:', email );
                } }
            />

        </div>
    )
} 
