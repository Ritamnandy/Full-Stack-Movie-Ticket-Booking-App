import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, User, X } from "lucide-react";

type SignupValues = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
};
type SignupModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin?: () => void;
    onSubmit: ( data: Omit<SignupValues, "confirmPassword" | "terms"> ) => Promise<void> | void;
};

const GoogleIcon = () => (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.4-4.7 7l7.4 5.7c4.3-4 6.9-9.9 7-17.2z" />
        <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
);

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

export default function SignupModal ( {
    isOpen,
    onClose,
    onSwitchToLogin,
    onSubmit

}: SignupModalProps )
{
    const [ showPassword, setShowPassword ] = useState( false );

    const {
        register,
        handleSubmit,
        reset,
        watch,
        getValues,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<SignupValues>( {
        defaultValues: { name: "", email: "", password: "", confirmPassword: "", terms: false },
        mode: "onTouched",
    } );

    // eslint-disable-next-line react-hooks/incompatible-library
    const passwordValue = watch( "password" );
    const strength = getStrength( passwordValue ?? "" );

    // Reset the form whenever the modal closes
    useEffect( () =>
    {
        if ( !isOpen )
        {
            reset();
            setShowPassword( false );
        }
    }, [ isOpen, reset ] );

    // Close on Esc + lock page scroll while open
    useEffect( () =>
    {
        if ( !isOpen ) return;
        const onKey = ( e: KeyboardEvent ) => e.key === "Escape" && onClose();
        window.addEventListener( "keydown", onKey );
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () =>
        {
            window.removeEventListener( "keydown", onKey );
            document.body.style.overflow = prevOverflow;
        };
    }, [ isOpen, onClose ] );

    if ( !isOpen ) return null;

    const submit: SubmitHandler<SignupValues> = async ( { name, email, password } ) =>
    {
        try
        {
            await onSubmit( { name: name.trim(), email: email.trim(), password } );
            // onClose();
        } catch ( err )
        {
            setError( "root.serverError", {
                message: err instanceof Error ? err.message : "Something went wrong. Try again.",
            } );
        }
    };

    const handleGoogle = () =>
    {
        console.log( 'Google signup function called' );

        window.location.href = `${ import.meta.env.VITE_GOOGLE_AUTH_URL }`;
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

    const eyeToggle = (
        <button
            type="button"
            onClick={ () => setShowPassword( ( s ) => !s ) }
            aria-label={ showPassword ? "Hide password" : "Show password" }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer"
        >
            { showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" /> }
        </button>
    );

    return (
        <div
            className="animate-backdrop-in fixed inset-0 z-9990 flex items-start sm:items-center justify-center px-4 py-6 overflow-y-auto bg-black/70 backdrop-blur-sm"
            onMouseDown={ ( e ) => e.target === e.currentTarget && onClose() }
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-title"
        >
            <div className="animate-card-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-primary/10 my-auto">
                {/* Glow accents */ }
                <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/30 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-pink-500/20 blur-[90px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent" />

                {/* Close */ }
                <button
                    type="button"
                    onClick={ onClose }
                    aria-label="Close"
                    className="absolute top-4 right-4 z-10 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative px-7 sm:px-9 pt-10 pb-7">
                    {/* Header */ }
                    <div className="text-center">
                        <p className="text-2xl font-bold tracking-tight">
                            <span className="text-primary">Q</span>uickShow
                        </p>
                        <h2 id="signup-title" className="mt-5 text-xl font-semibold">
                            Create your account
                        </h2>
                        <p className="mt-1.5 text-sm text-gray-400">
                            Join to book tickets and save your favorite movies
                        </p>
                    </div>

                    {/* Google */ }
                    <button
                        type="button"
                        onClick={ handleGoogle }
                        className="mt-7 flex w-full items-center justify-center gap-3 h-12 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-medium transition active:scale-[0.98] cursor-pointer"
                    >
                        <GoogleIcon />
                        Sign up with Google
                    </button>

                    {/* Divider */ }
                    <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-gray-500">
                        <div className="h-px flex-1 bg-white/10" />
                        or
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* Form */ }
                    <form onSubmit={ handleSubmit( submit ) } noValidate className="flex flex-col gap-4">
                        {/* Name */ }
                        <div>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    autoComplete="name"
                                    aria-invalid={ !!errors.name }
                                    className={ inputClass( !!errors.name ) }
                                    { ...register( "name", {
                                        validate: ( v ) => v.trim().length >= 2 || "Please enter your full name.",
                                    } ) }
                                />
                            </div>
                            { fieldError( errors.name?.message ) }
                        </div>

                        {/* Email */ }
                        <div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    autoComplete="email"
                                    aria-invalid={ !!errors.email }
                                    className={ inputClass( !!errors.email ) }
                                    { ...register( "email", {
                                        required: "Email is required.",
                                        pattern: {
                                            value: /^\S+@\S+\.\S+$/,
                                            message: "Please enter a valid email address.",
                                        },
                                    } ) }
                                />
                            </div>
                            { fieldError( errors.email?.message ) }
                        </div>

                        {/* Password + strength */ }
                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type={ showPassword ? "text" : "password" }
                                    placeholder="Password"
                                    autoComplete="new-password"
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
                                { eyeToggle }
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
                                        Strength: <span className="text-gray-200">{ STRENGTH_LABELS[ strength ] }</span>
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
                                    placeholder="Confirm password"
                                    autoComplete="new-password"
                                    aria-invalid={ !!errors.confirmPassword }
                                    className={ inputClass( !!errors.confirmPassword ) }
                                    { ...register( "confirmPassword", {
                                        required: "Please confirm your password.",
                                        validate: ( v ) => v === getValues( "password" ) || "Passwords do not match.",
                                    } ) }
                                />
                            </div>
                            { fieldError( errors.confirmPassword?.message ) }
                        </div>

                        {/* Terms */ }
                        <div>
                            <label className="flex items-start gap-3 cursor-pointer select-none">
                                <span className="relative mt-0.5 shrink-0">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        { ...register( "terms", {
                                            required: "You must accept the terms to continue.",
                                        } ) }
                                    />
                                    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/20 bg-white/5 transition peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                                        <Check className="w-3.5 h-3.5 text-white transition-opacity" strokeWidth={ 3 } />
                                    </span>
                                </span>
                                <span className="text-xs leading-relaxed text-gray-400">
                                    I agree to the{ " " }
                                    <span className="text-white hover:text-primary transition">Terms of Service</span>{ " " }
                                    and{ " " }
                                    <span className="text-white hover:text-primary transition">Privacy Policy</span>.
                                </span>
                            </label>
                            { fieldError( errors.terms?.message ) }
                        </div>

                        {/* Server error */ }
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
                                    Create account
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </>
                            ) }
                        </button>
                    </form>

                    {/* Switch to login */ }
                    <p className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{ " " }
                        <button
                            type="button"
                            onClick={ onSwitchToLogin }
                            className="font-semibold text-white hover:text-primary transition cursor-pointer"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}