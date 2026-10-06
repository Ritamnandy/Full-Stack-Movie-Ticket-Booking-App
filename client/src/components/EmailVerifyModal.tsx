import {
    useEffect,
    useRef,
    useState,
    type ClipboardEvent,
    type KeyboardEvent,
} from "react";
import { ArrowRight, Check, Loader2, MailCheck, X } from "lucide-react";

const LENGTH = 6;
const RESEND_SECONDS = 60*5;

type Status = "idle" | "loading" | "success";

type EmailVerifyModalProps = {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onVerify?: (code: string) => Promise<void> | void;
    onResend?: () => Promise<void> | void;
    onChangeEmail?: () => void;
};

// Wrapper: the inner component unmounts when closed, so all its state resets
export default function EmailVerifyModal({ isOpen, ...rest }: EmailVerifyModalProps) {
    if (!isOpen) return null;
    return <VerifyForm {...rest} />;
}

function VerifyForm({
    onClose,
    onVerify,
    onResend,
    onChangeEmail,
}: Omit<EmailVerifyModalProps, "isOpen">) {
    const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState("");
    const [shakeKey, setShakeKey] = useState(0);
    const [cooldown, setCooldown] = useState(RESEND_SECONDS);
    const [resending, setResending] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const code = digits.join("");
    const isComplete = code.length === LENGTH;

    // Focus the first box on open
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Resend countdown
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    // Close on Esc + lock page scroll + clear pending timer on unmount
    useEffect(() => {
        const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
            if (closeTimer.current) clearTimeout(closeTimer.current);
        };
    }, [onClose]);

    const verify = async (value: string) => {
        if (status === "loading") return;
        setError("");
        setStatus("loading");
        try {
            await onVerify?.(value);
            setStatus("success");
            closeTimer.current = setTimeout(onClose, 1600);
        } catch (err) {
            setStatus("idle");
            setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
            setDigits(Array(LENGTH).fill(""));
            setShakeKey((k) => k + 1);
            inputRefs.current[0]?.focus();
        }
    };

    const handleChange = (index: number, raw: string) => {
        const digit = raw.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[index] = digit;
        setDigits(next);
        setError("");

        if (digit && index < LENGTH - 1) inputRefs.current[index + 1]?.focus();

        // Auto-submit when the last box is filled
        if (digit && next.every(Boolean)) verify(next.join(""));
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            const next = [...digits];
            next[index - 1] = "";
            setDigits(next);
            inputRefs.current[index - 1]?.focus();
            e.preventDefault();
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
        if (!pasted) return;

        const next = Array(LENGTH).fill("");
        pasted.split("").forEach((d, i) => (next[i] = d));
        setDigits(next);
        setError("");

        inputRefs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
        if (pasted.length === LENGTH) verify(pasted);
    };

    const handleResend = async () => {
        if (cooldown > 0 || resending) return;
        try {
            setResending(true);
            await onResend?.();
            setCooldown(RESEND_SECONDS);
            setDigits(Array(LENGTH).fill(""));
            setError("");
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not resend the code.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div
            className="animate-backdrop-in fixed inset-0 z-9990 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-title"
        >
            <div className="animate-card-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-primary/10">
                {/* Glow accents */}
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-primary/30 blur-[90px]" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-pink-500/20 blur-[90px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent" />

                {/* Close */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 z-10 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative px-7 sm:px-9 pt-10 pb-8">
                    {status === "success" ? (
                        /* Success state */
                        <div className="flex flex-col items-center text-center py-6">
                            <div className="animate-pop-in flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30">
                                <Check className="w-10 h-10 text-white" strokeWidth={3} />
                            </div>
                            <h2 className="mt-6 text-xl font-semibold">Email verified</h2>
                            <p className="mt-1.5 text-sm text-gray-400">
                                Your account is ready. Welcome to QuickShow!
                            </p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-7 px-8 h-11 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
                            >
                                Continue
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="text-center">
                                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-primary to-pink-500 shadow-lg shadow-primary/40">
                                        <MailCheck className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <h2 id="verify-title" className="mt-6 text-xl font-semibold">
                                    Verify your email
                                </h2>
                                <p className="mt-1.5 text-sm text-gray-400">
                                    We sent a 6-digit code to
                                </p>
                                <p className="mt-0.5 text-sm font-medium text-white break-all">Your Email</p>
                            </div>

                            {/* Code inputs */}
                            <div
                                key={shakeKey}
                                className={`mt-8 flex justify-center gap-2 sm:gap-3 ${
                                    shakeKey > 0 ? "animate-shake" : ""
                                }`}
                            >
                                {digits.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => {
                                            inputRefs.current[i] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete={i === 0 ? "one-time-code" : "off"}
                                        maxLength={1}
                                        value={digit}
                                        disabled={status === "loading"}
                                        aria-label={`Digit ${i + 1}`}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        onPaste={handlePaste}
                                        onFocus={(e) => e.target.select()}
                                        className={`h-14 w-11 sm:w-12 rounded-2xl border bg-white/5 text-center text-xl font-semibold text-white
                                            focus:outline-none focus:bg-white/[0.07] focus:ring-4 transition disabled:opacity-60 ${
                                                error
                                                    ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/15"
                                                    : digit
                                                      ? "border-primary/60 focus:border-primary focus:ring-primary/15"
                                                      : "border-white/10 focus:border-primary/70 focus:ring-primary/15"
                                            }`}
                                    />
                                ))}
                            </div>

                            {error && (
                                <p role="alert" className="mt-4 text-center text-xs text-red-400">
                                    {error}
                                </p>
                            )}

                            {/* Verify button */}
                            <button
                                type="button"
                                onClick={() => verify(code)}
                                disabled={!isComplete || status === "loading"}
                                className="group mt-7 flex w-full items-center justify-center gap-2 h-12 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                                {status === "loading" ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Verify email
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>

                            {/* Resend */}
                            <p className="mt-6 text-center text-sm text-gray-400">
                                Didn't get the code?{" "}
                                {cooldown > 0 ? (
                                    <span className="text-gray-500">
                                            Resend in <span className="tabular-nums text-gray-300">
                                            
                                                {Math.ceil(cooldown / 60)}:{String(cooldown % 60).padStart(2, "0")}
                                            
                                            </span>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="font-semibold text-white hover:text-primary transition disabled:opacity-60 cursor-pointer"
                                    >
                                        {resending ? "Sending..." : "Resend code"}
                                    </button>
                                )}
                            </p>

                            {onChangeEmail && (
                                <p className="mt-2 text-center text-xs text-gray-500">
                                    Wrong email?{" "}
                                    <button
                                        type="button"
                                        onClick={onChangeEmail}
                                        className="text-gray-300 hover:text-primary transition cursor-pointer"
                                    >
                                        Change it
                                    </button>
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}