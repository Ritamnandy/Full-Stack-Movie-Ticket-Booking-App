import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Eye, EyeOff, Link2Off, Loader2, Lock, ShieldCheck } from "lucide-react";
import BlurCircle from "../components/BlurCircle";
import { useAuth } from "../hooks/useAuth";


type FormValues = {
    password: string;
    confirmPassword: string;
};

// 0 to 4 based on length, mixed case, number, symbol
const getStrength = ( value: string ) =>
{
    let score = 0;
    if ( value.length >= 8 ) score++;
    if ( /[a-z]/.test( value ) && /[A-Z]/.test( value ) ) score++;
    if ( /\d/.test( value ) ) score++;
    if ( /[^A-Za-z0-9]/.test( value ) ) score++;
    return score;
};

const STRENGTH_LABELS = [ "Too weak", "Weak", "Fair", "Good", "Strong" ];
const STRENGTH_COLORS = [ "bg-white/10", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500" ];

export default function ResetPassword ()
{
    const [ searchParams ] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get( "token" );
    console.log(token);
    
    const { resetPassword } = useAuth()
    const [ showPassword, setShowPassword ] = useState( false );
    const [ done, setDone ] = useState( false );
    const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>( null );

    const {
        register,
        handleSubmit,
        watch,
        getValues,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>( {
        defaultValues: { password: "", confirmPassword: "" },
        mode: "onTouched",
    } );

    // eslint-disable-next-line react-hooks/incompatible-library
    const passwordValue = watch( "password" );
    const strength = getStrength( passwordValue ?? "" );

    useEffect( () =>
    {
        return () =>
        {
            if ( redirectTimer.current ) clearTimeout( redirectTimer.current );
        };
    }, [] );

    const goToLogin = () => navigate( "/", { state: { openLogin: true } } );

    const submit: SubmitHandler<FormValues> = async ( { password } ) =>
    {
        try
        {
            await resetPassword( {
                password,
                token: token ?? ""
            } )

            setDone( true );
            redirectTimer.current = setTimeout( goToLogin, 3000 );
        } catch ( err )
        {
            setError( "root.serverError", {
                message:
                    err instanceof Error
                        ? err.message
                        : "This link is invalid or has expired. Please request a new one.",
            } );
        }
    };

    const inputClass = ( hasError: boolean ) =>
        `w-full h-12 pl-11 pr-4 rounded-full bg-white/5 border text-sm text-white placeholder-gray-500
         focus:outline-none focus:bg-white/[0.07] focus:ring-4 transition ${ hasError
            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/15"
            : "border-white/10 focus:border-primary/70 focus:ring-primary/15"
        }`;

    const fieldError = ( message?: string ) =>
        message && (
            <p role="alert" className="mt-1.5 pl-4 text-xs text-red-400">
                { message }
            </p>
        );

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 pt-28 pb-16 overflow-hidden">
            <BlurCircle topValue="120px" leftValue="10%" />
            <BlurCircle bottomValue="40px" rightValue="10%" />

            <div className="animate-card-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-primary/10">
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-primary/30 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-pink-500/20 blur-[90px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent" />

                <div className="relative px-7 sm:px-9 py-10">
                    { !token ? (
                        /* Invalid link */
                        <div className="flex flex-col items-center text-center">
                            <div className="animate-pop-in flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
                                <Link2Off className="w-9 h-9 text-red-400" />
                            </div>
                            <h1 className="mt-6 text-xl font-semibold">Invalid reset link</h1>
                            <p className="mt-1.5 text-sm text-gray-400">
                                This link is missing or has expired. Request a new one and try again.
                            </p>
                            <Link
                                to="/"
                                state={ { openForgot: true } }
                                className="mt-7 flex w-full items-center justify-center h-12 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition"
                            >
                                Request new link
                            </Link>
                        </div>
                    ) : done ? (
                        /* Success */
                        <div className="flex flex-col items-center text-center">
                            <div className="animate-pop-in flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30">
                                <Check className="w-10 h-10 text-white" strokeWidth={ 3 } />
                            </div>
                            <h1 className="mt-6 text-xl font-semibold">Password updated</h1>
                            <p className="mt-1.5 text-sm text-gray-400">
                                Your password has been changed. You can now sign in with your new password.
                            </p>
                            <button
                                type="button"
                                onClick={ goToLogin }
                                className="group mt-7 flex w-full items-center justify-center gap-2 h-12 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
                            >
                                Continue to sign in
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                            <p className="mt-4 text-xs text-gray-500">Redirecting automatically...</p>
                        </div>
                    ) : (
                        /* Form */
                        <>
                            <div className="text-center">
                                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-primary to-pink-500 shadow-lg shadow-primary/40">
                                        <ShieldCheck className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h1 className="mt-6 text-xl font-semibold">Set a new password</h1>
                                <p className="mt-1.5 text-sm text-gray-400">
                                    Choose a strong password you haven't used before.
                                </p>
                            </div>

                            <form
                                onSubmit={ handleSubmit( submit ) }
                                noValidate
                                className="mt-8 flex flex-col gap-4"
                            >
                                {/* New password + strength */ }
                                <div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type={ showPassword ? "text" : "password" }
                                            placeholder="New password"
                                            autoComplete="new-password"
                                            autoFocus
                                            aria-invalid={ !!errors.password }
                                            className={ `${ inputClass( !!errors.password ) } pr-12` }
                                            { ...register( "password", {
                                                required: "Password is required.",
                                                minLength: { value: 8, message: "Use at least 8 characters." },
                                                validate: ( v ) =>
                                                    ( /[A-Za-z]/.test( v ) && /\d/.test( v ) ) ||
                                                    "Include at least one letter and one number.",
                                            } ) }
                                        />
                                        <button
                                            type="button"
                                            onClick={ () => setShowPassword( ( s ) => !s ) }
                                            aria-label={ showPassword ? "Hide password" : "Show password" }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer"
                                        >
                                            { showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" /> }
                                        </button>
                                    </div>
                                    { fieldError( errors.password?.message ) }

                                    { passwordValue && (
                                        <div className="mt-2.5 px-2">
                                            <div className="flex gap-1.5">
                                                { [ 1, 2, 3, 4 ].map( ( bar ) => (
                                                    <div
                                                        key={ bar }
                                                        className={ `h-1 flex-1 rounded-full transition-colors duration-300 ${ strength >= bar ? STRENGTH_COLORS[ strength ] : "bg-white/10"
                                                            }` }
                                                    />
                                                ) ) }
                                            </div>
                                            <p className="mt-1.5 text-[11px] text-gray-400">
                                                Strength:{ " " }
                                                <span className="text-gray-200">{ STRENGTH_LABELS[ strength ] }</span>
                                            </p>
                                        </div>
                                    ) }
                                </div>

                                {/* Confirm password */ }
                                <div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type={ showPassword ? "text" : "password" }
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                            aria-invalid={ !!errors.confirmPassword }
                                            className={ inputClass( !!errors.confirmPassword ) }
                                            { ...register( "confirmPassword", {
                                                required: "Please confirm your password.",
                                                validate: ( v ) =>
                                                    v === getValues( "password" ) || "Passwords do not match.",
                                            } ) }
                                        />
                                    </div>
                                    { fieldError( errors.confirmPassword?.message ) }
                                </div>

                                { errors.root?.serverError && (
                                    <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
                                        { errors.root.serverError.message }
                                    </p>
                                ) }

                                <button
                                    type="submit"
                                    disabled={ isSubmitting }
                                    className="group mt-1 flex items-center justify-center gap-2 h-12 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    { isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Reset password
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    ) }
                                </button>
                            </form>
                        </>
                    ) }
                </div>
            </div>
        </div>
    );
}