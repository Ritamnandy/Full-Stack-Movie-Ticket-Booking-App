import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail, MailCheck, X } from "lucide-react";

const RESEND_SECONDS = 30;

type FormValues = { email: string };

type ForgotPasswordModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onBackToLogin: () => void;
    onSubmit?: ( email: string ) => Promise<void> | void;
    onResend?: ( email: string ) => Promise<void> | void;
};

// Wrapper: the inner component unmounts when closed, so all its state resets
export default function ForgotPasswordModal ( { isOpen, ...rest }: ForgotPasswordModalProps )
{
    if ( !isOpen ) return null;
    return <ForgotForm { ...rest } />;
}

function ForgotForm ( {
    onClose,
    onBackToLogin,
    onSubmit,
    onResend,
}: Omit<ForgotPasswordModalProps, "isOpen"> )
{
    const [ sentTo, setSentTo ] = useState<string | null>( null );
    const [ cooldown, setCooldown ] = useState( 0 );
    const [ resending, setResending ] = useState( false );
    const [ resendError, setResendError ] = useState( "" );
    const [ resendDone, setResendDone ] = useState( false );
    const doneTimer = useRef<ReturnType<typeof setTimeout> | null>( null );

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>( {
        defaultValues: { email: "" },
        mode: "onTouched",
    } );

    // Close on Esc + lock page scroll + clear timer on unmount
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
            if ( doneTimer.current ) clearTimeout( doneTimer.current );
        };
    }, [ onClose ] );

    // Resend countdown
    useEffect( () =>
    {
        if ( cooldown <= 0 ) return;
        const t = setTimeout( () => setCooldown( ( c ) => c - 1 ), 1000 );
        return () => clearTimeout( t );
    }, [ cooldown ] );

    const submit: SubmitHandler<FormValues> = async ( { email } ) =>
    {
        const clean = email.trim();
        try
        {
            await onSubmit?.( clean );
            setSentTo( clean );
            setCooldown( RESEND_SECONDS );
        } catch ( err )
        {
            setError( "root.serverError", {
                message: err instanceof Error ? err.message : "Something went wrong. Try again.",
            } );
        }
    };

    const handleResend = async () =>
    {
        if ( !sentTo || cooldown > 0 || resending ) return;
        try
        {
            setResending( true );
            setResendError( "" );
            await onResend?.( sentTo );
            setCooldown( RESEND_SECONDS );
            setResendDone( true );
            doneTimer.current = setTimeout( () => setResendDone( false ), 3000 );
        } catch ( err )
        {
            setResendError( err instanceof Error ? err.message : "Could not resend the email." );
        } finally
        {
            setResending( false );
        }
    };

    const inputClass = ( hasError: boolean ) =>
        `w-full h-12 pl-11 pr-4 rounded-full bg-white/5 border text-sm text-white placeholder-gray-500
         focus:outline-none focus:bg-white/[0.07] focus:ring-4 transition ${ hasError
            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/15"
            : "border-white/10 focus:border-primary/70 focus:ring-primary/15"
        }`;

    return (
        <div
            className="animate-backdrop-in fixed inset-0 z-9990 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
            onMouseDown={ ( e ) => e.target === e.currentTarget && onClose() }
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-title"
        >
            <div className="animate-card-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-primary/10">
                {/* Glow accents */ }
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-primary/30 blur-[90px]" />
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

                <div className="relative px-7 sm:px-9 pt-10 pb-8">
                    { sentTo ? (
                        /* Step 2: check your inbox */
                        <div className="flex flex-col items-center text-center">
                            <div className="animate-pop-in flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-primary to-pink-500 shadow-lg shadow-primary/40">
                                <MailCheck className="w-10 h-10 text-white" />
                            </div>

                            <h2 id="forgot-title" className="mt-6 text-xl font-semibold">
                                Check your email
                            </h2>
                            <p className="mt-1.5 text-sm text-gray-400">
                                We sent a password reset link to
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-white break-all">{ sentTo }</p>
                            <p className="mt-4 text-xs leading-relaxed text-gray-500">
                                The link expires soon. If you don't see it, check your spam folder.
                            </p>

                            <button
                                type="button"
                                onClick={ onBackToLogin }
                                className="group mt-7 flex w-full items-center justify-center gap-2 h-12 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
                            >
                                Back to sign in
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>

                            <p className="mt-6 text-sm text-gray-400">
                                Didn't get it?{ " " }
                                { cooldown > 0 ? (
                                    <span className="text-gray-500">
                                        Resend in <span className="tabular-nums text-gray-300">{ cooldown }s</span>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={ handleResend }
                                        disabled={ resending }
                                        className="font-semibold text-white hover:text-primary transition disabled:opacity-60 cursor-pointer"
                                    >
                                        { resending ? "Sending..." : "Resend email" }
                                    </button>
                                ) }
                            </p>

                            { resendDone && (
                                <p role="status" className="mt-2 text-xs text-green-400">
                                    Email sent again.
                                </p>
                            ) }
                            { resendError && (
                                <p role="alert" className="mt-2 text-xs text-red-400">
                                    { resendError }
                                </p>
                            ) }
                        </div>
                    ) : (
                        /* Step 1: enter email */
                        <>
                            <div className="text-center">
                                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-primary to-pink-500 shadow-lg shadow-primary/40">
                                        <KeyRound className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <h2 id="forgot-title" className="mt-6 text-xl font-semibold">
                                    Forgot your password?
                                </h2>
                                <p className="mt-1.5 text-sm text-gray-400">
                                    Enter your email and we'll send you a link to reset it.
                                </p>
                            </div>

                            <form
                                onSubmit={ handleSubmit( submit ) }
                                noValidate
                                className="mt-8 flex flex-col gap-4"
                            >
                                <div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            placeholder="Email address"
                                            autoComplete="email"
                                            autoFocus
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
                                    { errors.email?.message && (
                                        <p role="alert" className="mt-1.5 pl-4 text-xs text-red-400">
                                            { errors.email.message }
                                        </p>
                                    ) }
                                </div>

                                { errors.root?.serverError && (
                                    <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
                                        { errors.root.serverError.message }
                                    </p>
                                ) }

                                <button
                                    type="submit"
                                    disabled={ isSubmitting }
                                    className="group flex items-center justify-center gap-2 h-12 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    { isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Send reset link
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    ) }
                                </button>
                            </form>

                            <button
                                type="button"
                                onClick={ onBackToLogin }
                                className="mx-auto mt-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to sign in
                            </button>
                        </>
                    ) }
                </div>
            </div>
        </div>
    );
}