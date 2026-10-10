import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, X } from "lucide-react";

type FormValues = {
    email: string;
    password: string;
};

type LoginModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignup: () => void;
    onSubmit?: (
        data: { email: string; password: string }
    ) => Promise<void> | void;
    onForgotPassword?: () => void;
};

const GoogleIcon = () => (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.4-4.7 7l7.4 5.7c4.3-4 6.9-9.9 7-17.2z" />
        <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
);

// Wrapper: the form unmounts when closed, so all its state resets automatically
export default function LoginModal ( { isOpen, onClose, onSwitchToSignup, onSubmit, onForgotPassword }: LoginModalProps )
{
    if ( !isOpen ) return null;
    return <LoginForm onClose={ onClose } onSwitchToSignup={ onSwitchToSignup } onSubmit={ onSubmit } onForgotPassword={ onForgotPassword } />;
}

function LoginForm ( {
    onClose,
    onSwitchToSignup,
    onForgotPassword,
    onSubmit
}: Omit<LoginModalProps, "isOpen"> )
{
    const [ showPassword, setShowPassword ] = useState( false );

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>( {
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
    } );

    // Close on Esc + lock page scroll while open
    useEffect( () =>
    {
        const onKey = ( e: KeyboardEvent ) => e.key === "Escape" && onClose();
        window.addEventListener( "keydown", onKey );
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () =>
        {
            window.removeEventListener( "keydown", onKey );
            document.body.style.overflow = prevOverflow;
        };
    }, [ onClose ] );

    const submit: SubmitHandler<FormValues> = async ( data ) =>
    {
        try
        {
            // TODO: call your login API here
            await onSubmit?.( {
                email: data.email ?? "",
                password: data.password ?? "",
            } );
            onClose();
        } catch ( err )
        {
            setError( "root.serverError", {
                message: err instanceof Error ? err.message : "Something went wrong. Try again.",
            } );
        }
    };

    const handleGoogle = () =>
    {
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

    return (
        <div
            className="animate-backdrop-in fixed inset-0 z-9990 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
            onMouseDown={ ( e ) => e.target === e.currentTarget && onClose() }
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
        >
            <div className="animate-card-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-primary/10">
                {/* Glow accents */ }
                <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-primary/30 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-pink-500/20 blur-[90px]" />
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
                        <h2 id="login-title" className="mt-5 text-xl font-semibold">
                            Welcome back
                        </h2>
                        <p className="mt-1.5 text-sm text-gray-400">
                            Sign in to continue booking your movies
                        </p>
                    </div>

                    {/* Google */ }
                    <button
                        type="button"
                        onClick={ handleGoogle }
                        className="mt-7 flex w-full items-center justify-center gap-3 h-12 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-medium transition active:scale-[0.98] cursor-pointer"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    {/* Divider */ }
                    <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-gray-500">
                        <div className="h-px flex-1 bg-white/10" />
                        or
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* Form */ }
                    <form onSubmit={ handleSubmit( submit ) } noValidate className="flex flex-col gap-4">
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

                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type={ showPassword ? "text" : "password" }
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    aria-invalid={ !!errors.password }
                                    className={ `${ inputClass( !!errors.password ) } pr-12` }
                                    { ...register( "password", {
                                        required: "Password is required.",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters.",
                                        },
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
                        </div>

                        <div className="-mt-1 text-right">
                            <button
                                onClick={ onForgotPassword }
                                type="button"
                                className="text-xs text-gray-400 hover:text-primary transition cursor-pointer "
                            >
                                Forgot password?
                            </button>
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
                                    Continue
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </>
                            ) }
                        </button>
                    </form>

                    {/* Switch to signup */ }
                    <p className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{ " " }
                        <button
                            type="button"
                            onClick={ onSwitchToSignup }
                            className="font-semibold text-white hover:text-primary transition cursor-pointer"
                        >
                            Sign up
                        </button>
                    </p>

                    <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-500">
                        By continuing you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}