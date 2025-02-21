import { Router } from "express";
import validation from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/index.js";
import * as userValidation from './user.validation.js'
import * as userServices from './user.service.js'
import { formatOptions, multerHost } from "../../middleware/multer.js";
import authentication from "../../middleware/authentication.js";


const userRouter=Router()
userRouter.post('/signInWithGmail',validation(userValidation.signInWithGmailSchema),asyncHandler(userServices.signInWithGmail))
userRouter.post('/signup',multerHost(formatOptions.image).fields([{name:"profileImage",maxCount:1},{name:"coverImages",maxCount:3}]),validation(userValidation.signUpSchema),asyncHandler(userServices.signUp))
userRouter.patch('/confirmEmail',validation(userValidation.confirmSchema),asyncHandler(userServices.confirmEmail))
userRouter.post('/resendOtp',asyncHandler(userServices.resendOtp))
userRouter.post('/signin',validation(userValidation.signInSchema),asyncHandler(userServices.signIn))
userRouter.get('/refreshToken',validation(userValidation.refreshTokenSchema),asyncHandler(userServices.refreshTokenCheck))
userRouter.patch('/forgetPassword',validation(userValidation.emailSchema),asyncHandler(userServices.forgetPassword))
userRouter.patch('/resetPassword',validation(userValidation.resetPasswordSchema),asyncHandler(userServices.resetPassword))
userRouter.patch('/updatePassword',validation(userValidation.updatePasswordSchema),authentication,asyncHandler(userServices.updatePassword))
userRouter.get('/profile',authentication,asyncHandler(userServices.getProfile) ); 
userRouter.patch('/add/:userId',authentication,asyncHandler(userServices.addFriend) ); 


export default userRouter