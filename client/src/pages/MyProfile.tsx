import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import
    {
        Camera,
        Check,
        Eye,
        EyeOff,
        Heart,
        Loader2,
        Lock,
        Mail,
        Shield,
        TicketPlus,
        Trash2,
        User,
        UserRound,
    } from "lucide-react";
import BlurCircle from "../components/BlurCircle";

export type ProfileUser = {
    name: string;
    email: string;
    phone?: string;
    avatar?: string | null;
    isAdmin?: boolean;
};

type MyProfileProps = {
    user: ProfileUser;
    hasPassword?: boolean; // false for Google-only accounts
    bookingsCount?: number;
    favoritesCount?: number;
    onSaveProfile?: ( data: { name: string;  avatarFile: File | null } ) => Promise<void> | void;
    onChangePassword?: ( data: { currentPassword: string; newPassword: string } ) => Promise<void> | void;
    onDeleteAccount?: () => Promise<void> | void;
};

type ProfileValues = { name: string; };
type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };
type Tab = "profile" | "security";

const MAX_AVATAR_MB = 2;

const getInitials = ( name: string ) =>
    name
        .trim()
        .split( /\s+/ )
        .slice( 0, 2 )
        .map( ( p ) => p[ 0 ]?.toUpperCase() ?? "" )
        .join( "" ) || "U";

const inputClass = ( hasError: boolean ) =>
    `w-full h-12 pl-11 pr-4 rounded-full bg-white/5 border text-sm text-white placeholder-gray-500
     focus:outline-none focus:bg-white/[0.07] focus:ring-4 transition disabled:opacity-60 disabled:cursor-not-allowed ${ hasError
        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/15"
        : "border-white/10 focus:border-primary/70 focus:ring-primary/15"
    }`;

const fieldError = ( message?: string ) =>
    message && (
        <p role="alert" className="mt-1.5 pl-4 text-xs text-red-400">
            { message }
        </p>
    );

export default function MyProfile ( {
    user,
    hasPassword = true,
    bookingsCount,
    favoritesCount,
    onSaveProfile,
    onChangePassword,
    onDeleteAccount,
}: MyProfileProps )
{
    const [ tab, setTab ] = useState<Tab>( "profile" );

    // Avatar state
    const fileInputRef = useRef<HTMLInputElement>( null );
    const previewRef = useRef<string | null>( null );
    const [ avatarPreview, setAvatarPreview ] = useState<string | null>( null );
    const [ avatarFile, setAvatarFile ] = useState<File | null>( null );
    const [ avatarError, setAvatarError ] = useState( "" );
    const [ imgBroken, setImgBroken ] = useState( false );

    // Feedback
    const [ savedMessage, setSavedMessage ] = useState( "" );
    const savedTimer = useRef<ReturnType<typeof setTimeout> | null>( null );

    // Security tab
    const [ showPasswords, setShowPasswords ] = useState( false );

    // Danger zone
    const [ confirmDelete, setConfirmDelete ] = useState( false );
    const [ deleting, setDeleting ] = useState( false );

    // Profile form
    const profileForm = useForm<ProfileValues>( {
        defaultValues: { name: user.name, },
        mode: "onTouched",
    } );

    // Password form
    const passwordForm = useForm<PasswordValues>( {
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
        mode: "onTouched",
    } );

    // Clean up object URL and timer on unmount
    useEffect( () =>
    {
        return () =>
        {
            if ( previewRef.current ) URL.revokeObjectURL( previewRef.current );
            if ( savedTimer.current ) clearTimeout( savedTimer.current );
        };
    }, [] );

    const flashSaved = ( message: string ) =>
    {
        setSavedMessage( message );
        if ( savedTimer.current ) clearTimeout( savedTimer.current );
        savedTimer.current = setTimeout( () => setSavedMessage( "" ), 3000 );
    };

    const handleAvatarChange = ( e: ChangeEvent<HTMLInputElement> ) =>
    {
        const file = e.target.files?.[ 0 ];
        e.target.value = ""; // allow picking the same file again
        if ( !file ) return;

        if ( !file.type.startsWith( "image/" ) )
        {
            return setAvatarError( "Please choose an image file." );
        }
        if ( file.size > MAX_AVATAR_MB * 1024 * 1024 )
        {
            return setAvatarError( `Image must be smaller than ${ MAX_AVATAR_MB }MB.` );
        }

        if ( previewRef.current ) URL.revokeObjectURL( previewRef.current );
        const url = URL.createObjectURL( file );
        previewRef.current = url;

        setAvatarError( "" );
        setAvatarFile( file );
        setAvatarPreview( url );
    };

    const removeAvatarChange = () =>
    {
        if ( previewRef.current ) URL.revokeObjectURL( previewRef.current );
        previewRef.current = null;
        setAvatarPreview( null );
        setAvatarFile( null );
        setAvatarError( "" );
    };

    const saveProfile: SubmitHandler<ProfileValues> = async ( { name } ) =>
    {
        try
        {
            await onSaveProfile?.( { name: name.trim(), avatarFile } );
            profileForm.reset( { name: name.trim() } );
            setAvatarFile( null );
            flashSaved( "Profile updated successfully." );
        } catch ( err )
        {
            profileForm.setError( "root.serverError", {
                message: err instanceof Error ? err.message : "Could not save your profile. Try again.",
            } );
        }
    };

    const savePassword: SubmitHandler<PasswordValues> = async ( { currentPassword, newPassword } ) =>
    {
        try
        {
            await onChangePassword?.( { currentPassword, newPassword } );
            passwordForm.reset();
            flashSaved( "Password changed successfully." );
        } catch ( err )
        {
            passwordForm.setError( "root.serverError", {
                message: err instanceof Error ? err.message : "Could not change your password. Try again.",
            } );
        }
    };

    const handleDelete = async () =>
    {
        try
        {
            setDeleting( true );
            await onDeleteAccount?.();
        } finally
        {
            setDeleting( false );
            setConfirmDelete( false );
        }
    };

    const { errors: pErrors, isSubmitting: pSubmitting, isDirty: pDirty } = profileForm.formState;
    const { errors: sErrors, isSubmitting: sSubmitting } = passwordForm.formState;

    const shownAvatar = avatarPreview ?? ( !imgBroken ? user.avatar : null );
    const canSaveProfile = pDirty || !!avatarFile;

    const tabClass = ( active: boolean ) =>
        `flex items-center gap-2 px-5 h-10 rounded-full text-sm font-medium transition cursor-pointer ${ active ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-white"
        }`;

    return (
        <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 pb-24 min-h-[80vh] overflow-hidden">
            <BlurCircle topValue="100px" leftValue="100px" />
            <BlurCircle bottomValue="0px" rightValue="100px" />

            <div className="relative mx-auto max-w-3xl">
                <h1 className="text-lg md:text-2xl font-semibold mb-6">My Profile</h1>

                {/* Header card */ }
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-6 sm:p-8 shadow-2xl shadow-primary/10">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/25 blur-[90px]" />
                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent" />

                    <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                        {/* Avatar with upload */ }
                        <div className="relative shrink-0">
                            <div className="rounded-full p-1 bg-linear-to-br from-primary to-pink-500">
                                <div className="rounded-full bg-slate-950 p-1">
                                    { shownAvatar ? (
                                        <img
                                            src={ shownAvatar }
                                            alt={ user.name }
                                            referrerPolicy="no-referrer"
                                            onError={ () => setImgBroken( true ) }
                                            className="h-24 w-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-2xl font-semibold text-white">
                                            { getInitials( user.name ) }
                                        </div>
                                    ) }
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={ () => fileInputRef.current?.click() }
                                aria-label="Change profile photo"
                                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-primary text-white shadow-lg hover:bg-primary-dull active:scale-95 transition cursor-pointer"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                ref={ fileInputRef }
                                type="file"
                                accept="image/*"
                                onChange={ handleAvatarChange }
                                className="hidden"
                            />
                        </div>

                        <div className="min-w-0 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <h2 className="truncate text-xl font-semibold">{ user.name }</h2>
                                { user.isAdmin && (
                                    <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                                        Admin
                                    </span>
                                ) }
                            </div>
                            <p className="mt-0.5 truncate text-sm text-gray-400">{ user.email }</p>

                            { avatarFile && (
                                <p className="mt-2 text-xs text-gray-400">
                                    New photo selected.{ " " }
                                    <button
                                        type="button"
                                        onClick={ removeAvatarChange }
                                        className="text-primary hover:underline cursor-pointer"
                                    >
                                        Undo
                                    </button>
                                </p>
                            ) }
                            { avatarError && (
                                <p role="alert" className="mt-2 text-xs text-red-400">
                                    { avatarError }
                                </p>
                            ) }
                        </div>
                    </div>

                    {/* Quick stats */ }
                    <div className="relative mt-6 grid grid-cols-2 gap-3">
                        <Link
                            to="/my-bookings"
                            className="group flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-3 hover:border-primary/40 hover:bg-primary/15 transition"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-pink-500">
                                <TicketPlus className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold leading-none">{ bookingsCount ?? "-" }</p>
                                <p className="mt-1 text-xs text-gray-400">Bookings</p>
                            </div>
                        </Link>
                        <Link
                            to="/favorite"
                            className="group flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-3 hover:border-primary/40 hover:bg-primary/15 transition"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-pink-500">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold leading-none">{ favoritesCount ?? "-" }</p>
                                <p className="mt-1 text-xs text-gray-400">Favorites</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Tabs */ }
                <div className="mt-6 inline-flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                    <button type="button" onClick={ () => setTab( "profile" ) } className={ tabClass( tab === "profile" ) }>
                        <UserRound className="w-4 h-4" />
                        Profile
                    </button>
                    <button type="button" onClick={ () => setTab( "security" ) } className={ tabClass( tab === "security" ) }>
                        <Shield className="w-4 h-4" />
                        Security
                    </button>
                </div>

                {/* Success message */ }
                { savedMessage && (
                    <p
                        role="status"
                        className="animate-card-in mt-4 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-300"
                    >
                        <Check className="w-4 h-4" />
                        { savedMessage }
                    </p>
                ) }

                {/* Profile tab */ }
                { tab === "profile" && (
                    <form
                        // eslint-disable-next-line react-hooks/refs
                        onSubmit={ profileForm.handleSubmit( saveProfile ) }
                        noValidate
                        className="animate-card-in mt-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 sm:p-8"
                    >
                        <h3 className="text-base font-semibold">Personal information</h3>
                        <p className="mt-1 text-sm text-gray-400">Update your name and contact details.</p>

                        <div className="mt-6 flex flex-col gap-4">
                            <div>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        autoComplete="name"
                                        aria-invalid={ !!pErrors.name }
                                        className={ inputClass( !!pErrors.name ) }
                                        { ...profileForm.register( "name", {
                                            validate: ( v ) => v.trim().length >= 2 || "Please enter your full name.",
                                        } ) }
                                    />
                                </div>
                                { fieldError( pErrors.name?.message ) }
                            </div>

                            <div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        value={ user.email }
                                        disabled
                                        readOnly
                                        aria-label="Email address"
                                        className={ inputClass( false ) }
                                    />
                                </div>
                                <p className="mt-1.5 pl-4 text-xs text-gray-500">Your email can't be changed here.</p>
                            </div>

                            

                            <div className="flex flex-wrap justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={ !canSaveProfile || pSubmitting }
                                    onClick={ () =>
                                    {
                                        profileForm.reset();
                                        removeAvatarChange();
                                    } }
                                    className="px-6 h-11 rounded-full border border-white/15 text-sm font-medium hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={ !canSaveProfile || pSubmitting }
                                    className="flex items-center justify-center gap-2 px-7 h-11 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    { pSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save changes" }
                                </button>
                            </div>
                        </div>
                    </form>
                ) }

                {/* Security tab */ }
                { tab === "security" && (
                    <div className="animate-card-in mt-4 flex flex-col gap-6">
                        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 sm:p-8">
                            <h3 className="text-base font-semibold">Change password</h3>

                            { !hasPassword ? (
                                <p className="mt-2 text-sm text-gray-400">
                                    You signed in with Google, so there's no password to change.
                                </p>
                            ) : (
                                <form
                                    // eslint-disable-next-line react-hooks/refs
                                    onSubmit={ passwordForm.handleSubmit( savePassword ) }
                                    noValidate
                                    className="mt-6 flex flex-col gap-4"
                                >
                                    <div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type={ showPasswords ? "text" : "password" }
                                                placeholder="Current password"
                                                autoComplete="current-password"
                                                aria-invalid={ !!sErrors.currentPassword }
                                                className={ `${ inputClass( !!sErrors.currentPassword ) } pr-12` }
                                                { ...passwordForm.register( "currentPassword", {
                                                    required: "Enter your current password.",
                                                } ) }
                                            />
                                            <button
                                                type="button"
                                                onClick={ () => setShowPasswords( ( s ) => !s ) }
                                                aria-label={ showPasswords ? "Hide passwords" : "Show passwords" }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer"
                                            >
                                                { showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" /> }
                                            </button>
                                        </div>
                                        { fieldError( sErrors.currentPassword?.message ) }
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type={ showPasswords ? "text" : "password" }
                                                placeholder="New password"
                                                autoComplete="new-password"
                                                aria-invalid={ !!sErrors.newPassword }
                                                className={ inputClass( !!sErrors.newPassword ) }
                                                { ...passwordForm.register( "newPassword", {
                                                    required: "Enter a new password.",
                                                    minLength: { value: 8, message: "Use at least 8 characters." },
                                                    validate: ( v ) =>
                                                        ( /[A-Za-z]/.test( v ) && /\d/.test( v ) ) ||
                                                        "Include at least one letter and one number.",
                                                } ) }
                                            />
                                        </div>
                                        { fieldError( sErrors.newPassword?.message ) }
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type={ showPasswords ? "text" : "password" }
                                                placeholder="Confirm new password"
                                                autoComplete="new-password"
                                                aria-invalid={ !!sErrors.confirmPassword }
                                                className={ inputClass( !!sErrors.confirmPassword ) }
                                                { ...passwordForm.register( "confirmPassword", {
                                                    required: "Please confirm your new password.",
                                                    validate: ( v ) =>
                                                        v === passwordForm.getValues( "newPassword" ) ||
                                                        "Passwords do not match.",
                                                } ) }
                                            />
                                        </div>
                                        { fieldError( sErrors.confirmPassword?.message ) }
                                    </div>

                                    { sErrors.root?.serverError && (
                                        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
                                            { sErrors.root.serverError.message }
                                        </p>
                                    ) }

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={ sSubmitting }
                                            className="flex items-center justify-center gap-2 px-7 h-11 rounded-full bg-linear-to-r from-primary to-pink-500 text-sm font-semibold shadow-lg shadow-primary/30 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
                                        >
                                            { sSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update password" }
                                        </button>
                                    </div>
                                </form>
                            ) }
                        </div>

                        {/* Danger zone */ }
                        <div className="rounded-3xl border border-red-500/25 bg-red-500/5 p-6 sm:p-8">
                            <h3 className="text-base font-semibold text-red-300">Danger zone</h3>
                            <p className="mt-1 text-sm text-gray-400">
                                Deleting your account permanently removes your profile and booking history.
                            </p>

                            { confirmDelete ? (
                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                    <p className="text-sm text-gray-300">Are you sure? This can't be undone.</p>
                                    <button
                                        type="button"
                                        onClick={ () => setConfirmDelete( false ) }
                                        disabled={ deleting }
                                        className="px-5 h-10 rounded-full border border-white/15 text-sm font-medium hover:bg-white/10 transition cursor-pointer"
                                    >
                                        Keep account
                                    </button>
                                    <button
                                        type="button"
                                        onClick={ handleDelete }
                                        disabled={ deleting }
                                        className="flex items-center gap-2 px-5 h-10 rounded-full bg-red-500 text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition cursor-pointer"
                                    >
                                        { deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" /> }
                                        Yes, delete
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={ () => setConfirmDelete( true ) }
                                    className="mt-5 flex items-center gap-2 px-5 h-10 rounded-full border border-red-500/40 text-sm font-medium text-red-300 hover:bg-red-500/10 transition cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete account
                                </button>
                            ) }
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
}