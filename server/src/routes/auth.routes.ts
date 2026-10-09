
import
{
    registerController,
    verifyEmailController,
    loginController,
    resendCodeController,
    logoutController,
    refreshTokenController,
    forgotPasswordController,
    resetPasswordController,
    getUserController,
    deleteUserPermanently,
    upDateUserProfileData,
    googleLogin,
    profileImageController
} from "../controllers/auth.controller"
import { Router } from "express"
import passport from "passport"
import { forgotPasswordLimiter, loginLimiter, registerLimiter, resendCodeLimiter, verifyEmailLimiter } from "../middlewares/ratelimit.middlewares";
import { validate } from "../middlewares/validate.middlewares";
import { valivationScheme } from "../validators/user.validators"
import { verifyJwt } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";

const authRouter = Router()

// Step 1: send user to Google
authRouter.get(
    "/google",
    passport.authenticate( "google", { scope: [ "profile", "email" ], session: false } )
);

// Step 2: Google redirects back here
authRouter.get(
    "/google/callback",
    passport.authenticate( "google", {
        session: false,
        failureRedirect: process.env.ERROR_URL as string,
    } ),
    googleLogin
);

authRouter.route( "/register" )
    .post( registerLimiter, validate( valivationScheme.register ), registerController );

authRouter.route( "/login" )
    .post( loginLimiter, validate( valivationScheme.login ), loginController );

authRouter.route( "/verify" )
    .post( verifyEmailLimiter, validate( valivationScheme.verification ), verifyEmailController );

authRouter.route( "/resendotp" )
    .post( resendCodeLimiter, validate( valivationScheme.resendCode ), resendCodeController );

authRouter.route( "/forgotpassword" )
    .post( forgotPasswordLimiter, validate( valivationScheme.forgetPassword ), forgotPasswordController );

authRouter.route( "/resetpassword" )
    .post( validate( valivationScheme.resetPassword ), resetPasswordController );

authRouter.route( "/refreshtoken" )
    .post( refreshTokenController );



authRouter.route( "/logout" )
    .post( verifyJwt, logoutController );

authRouter.route( "/profile" )
    .post( verifyJwt, getUserController )
    .patch( verifyJwt, validate( valivationScheme.updateProfile ), upDateUserProfileData );


authRouter.route( "/delete" )
    .delete( verifyJwt, deleteUserPermanently )

authRouter.route( '/avatar' )
    .patch( verifyJwt, upload.single( 'avatar' ), profileImageController );

export default authRouter