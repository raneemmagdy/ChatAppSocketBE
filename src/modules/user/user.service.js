import {OAuth2Client} from 'google-auth-library'
import  { userModel,providerOptions} from '../../DB/models/index.js';
import { roleOptions } from '../../middleware/authorization.js';
import * as module from '../../utils/index.js';
import cloudinary from '../../utils/Cloudinary/index.js';
import { decodedToken, tokenTypes } from '../../middleware/authentication.js';


//------------------------------------------------signInWithGmail
export const signInWithGmail=async(req,res,next)=>{

    const {idToken}=req.body
    const client = new OAuth2Client();

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,  
        })
    const payload=ticket.getPayload()
    return payload
    }

 const userData=await verify()
 const {email_verified,name,email,picture}=userData
 if(!email_verified){
    return next(new Error('Email is invalid',{cause:400}))
 }
 let user= await userModel.findOne({email})
 if(!user){
    user= await userModel.create({email,name,confirmed:true,provider:providerOptions.google,profileImage:picture})
 }
 if(user.provider!=providerOptions.google){
    return next(new Error('invalid provider,please Log In With in System',{cause:400}))
 }
 const accessToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.user?process.env.ACCESS_JWT_SECRET_USER:process.env.ACCESS_JWT_SECRET_ADMIN,option:{ expiresIn: '1h' }})
 const refreshToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.user?process.env.REFRESH_JWT_SECRET_USER:process.env.REFRESH_JWT_SECRET_ADMIN,option:{ expiresIn: '1w' }})

 return res.status(201).json({message:'Done',Tokens:{accessToken,refreshToken}})
}

//------------------------------------------------signUp
export const signUp=async(req,res,next)=>{
   const {name,email,password,gender,phone,provider}=req.body
   if(await userModel.findOne({email})){
      return next(new Error('Email Already Exist',{cause:409}))
   }
   const users = await userModel.find({}, { phone: 1 });
   for (const user of users) {
       const decryptedPhone =await module.Decrypt({key:user.phone,SECRET_KEY:process.env.SECRET_KEY_PHONE}); 
       if (decryptedPhone === phone) {
         return next(new Error('Phone Already Exist',{cause:409}))
       }
   }
   let pathsForCoverImages=[]
   let pathForProfileImage={}
   if(req?.files){


    if (req?.files?.coverImages) {
      for (const file of req.files.coverImages) {
          const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
              folder: 'socialApp/users',
          });
          pathsForCoverImages.push({ public_id, secure_url });
      }
     }
  
    if (req?.files?.profileImage) {
          const { public_id, secure_url } = await cloudinary.uploader.upload(req.files.profileImage[0].path, {
           folder: 'socialApp/users',
          });
           pathForProfileImage = { public_id, secure_url };
     }
   }
 

   const hashPassword= await module.Hash({key:password,SALT_ROUND:process.env.SALT_ROUND})
   const encryptPhone= await module.Encrypt({key:phone,SECRET_KEY:process.env.SECRET_KEY_PHONE})
   module.emailEvent.emit('sendEmailConfirm',{name,email})
   const user= await userModel.create({name,email,password:hashPassword,phone:encryptPhone,gender,provider,profileImage:pathForProfileImage,coverImages:pathsForCoverImages})
   return res.status(201).json({message:"User Created Successfully...",user})
   

}

//------------------------------------------------confirmEmail
export const confirmEmail=async(req,res,next)=>{
   const {email,otp}=req.body
   const user =await userModel.findOne({email})
   if(!user){
      return next(new Error('Email Not Exist',{cause:404}))
   }
   if (user.confirmed) {
      return next(new Error('Email Already Confirmed', { cause: 400 }));
   }
   const isBanned =await  module.checkIfBanned(user);
   if (isBanned) {
      return next(new Error('You are temporarily banned for 5 minutes.. Please try again later.', { cause: 403 }));
   }
   const isOtpExpired = await module.checkOtpExpiration(user);
   if (isOtpExpired) {
      module.emailEvent.emit('sendEmailConfirm',{name:user.name,email})
      return next(new Error('OTP Expired,New OTP Send Using Email ', { cause: 400 }));
   }
   
   const compareOtp = await module.Compare({ key: otp, encryptedKey: user.otpEmail });

   if (!compareOtp) {
     const attemptsExceeded = await module.handleFailedAttempt(user); 
     if (attemptsExceeded.isBanned) {
       return next(
         new Error('Too many failed attempts. You are temporarily banned for 5 minutes.', { cause: 403 })
       );
     }
     
     return next(new Error(`Invalid OTP. You have ${attemptsExceeded.remainingAttempts} attempts remaining.`, { cause: 400 }));
   }

   await userModel.updateOne(
      { email: user.email },
      {
        confirmed: true ,$unset: { otpEmail: 0, otpCreatedAt: 0, failedAttempts: 0, banExpiry: 0 },
      }
    );
   return res.status(200).json({message:"Email Confirmed Successfully..."})
}

//------------------------------------------------signIn
export const signIn=async(req,res,next)=>{

   const { email, phone, password, idToken } = req.body;
   if (idToken) {
       return await signInWithGmail(req, res, next);
   }
   let user = null
   if(email) user=await userModel.findOne({ email });

   if(!user&&phone){
      const users = await userModel.find({}, { phone: 1 });
      for (const userInfo of users) {
          const decryptedPhone =await module.Decrypt({key:userInfo.phone,SECRET_KEY:process.env.SECRET_KEY_PHONE}); 
          if (decryptedPhone === phone) {
            user = await userModel.findById(userInfo._id); 
            break;
          }
      }
   }
   
   if (!user) {
       return next(new Error('Invalid Email/Phone or Password', { cause: 400 }));
   }
   if (user.provider!=providerOptions.application) {
      return next(new Error('please log in with google', { cause: 400 }));
   }
   if (!user.confirmed) {
      return next(new Error('Email not Confirmed yet', { cause: 400 }));
   }
   if(!await module.Compare({key:password,encryptedKey:user.password})){
      return next(new Error('invalid Email Or Password',{cause:400}))
   }
   if (user.twoStepVerification) {
     

      module.emailEvent.emit("2FA-OTP", { name: user.name, email: user.email });

      return res.status(200).json({ message: "2-step verification OTP sent to your email." });
    }
    const accessToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.user?process.env.ACCESS_JWT_SECRET_USER:process.env.ACCESS_JWT_SECRET_ADMIN,option:{ expiresIn: '1h' }})
    const refreshToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.user?process.env.REFRESH_JWT_SECRET_USER:process.env.REFRESH_JWT_SECRET_ADMIN,option:{ expiresIn: '1w' }})
   
   return res.status(200).json({message:"User loged In Successfully...",user, tokens:{accessToken,refreshToken}})
}

//------------------------------------------------refreshToken
export const refreshTokenCheck=async(req,res,next)=>{
   const {authorization}=req.body
   const user= await decodedToken({authorization,tokenType:tokenTypes.refresh,next})
   if (user.changedPasswordAt) {
      const tokenIssuedAt = payload.iat ; 
      const changedPasswordAt = parseInt(user.changedPasswordAt.getTime()/1000);
    

   
      if (tokenIssuedAt <=changedPasswordAt) {
          return next(new Error('Password was updated after this token was issued. Please log in again.', { cause: 403 }));
      }
   }
   const accessToken= await module.GenerateToken({payload:{email:user.email,id:user._id},JWT_SECRET:user.role==roleOptions.user?process.env.ACCESS_JWT_SECRET_USER:process.env.ACCESS_JWT_SECRET_ADMIN,option:{ expiresIn: '1h' }})
   const refreshToken= await module.GenerateToken({payload:{email:user.email,id:user._id},JWT_SECRET:user.role==roleOptions.user?process.env.REFRESH_JWT_SECRET_USER:process.env.REFRESH_JWT_SECRET_ADMIN,option:{ expiresIn: '1w' }})
  
   return res.status(200).json({message:"Done",user, tokens:{accessToken,refreshToken}})
}


//------------------------------------------------forgetPassword
export const forgetPassword=async(req,res,next)=>{
   const {email}=req.body
   const user =await userModel.findOne({email})
   if(!user){
      return next(new Error('invalid Email',{cause:400}))
   }
   if(user.isDeleted){
      return next(new Error('Account has been deleted', { cause: 400 }));
   }
   module.emailEvent.emit('sendEmailForgetPassword',{name:user.name,email})
   return res.status(200).json({message:"OTP send Successfully..."})
}

//------------------------------------------------resetPassword
export const resetPassword=async(req,res,next)=>{
   const {email,otp,newPassword,cNewPassword}=req.body
   const user =await userModel.findOne({email})
   if(!user){
      return next(new Error('invalid Email',{cause:400}))
   }
   if(user.isDeleted){
      return next(new Error('Account has been deleted', { cause: 400 }));
   }
   const hashPassword= await module.Hash({key:newPassword,SALT_ROUND:process.env.SALT_ROUND})
   const isOtpExpired =await module.checkOtpExpiration(user);


   const isBanned =await module.checkIfBanned(user);
   if (isBanned) {
      return next(new Error('You are temporarily banned for 5 minutes.. Please try again later.', { cause: 403 }));
   }
   if (isOtpExpired) {
      module.emailEvent.emit('sendEmailForgetPassword',{name:user.name,email})
      return next(new Error('OTP Expired,New OTP Send Using Email ', { cause: 400 }));
      
   }

   const compareOtp = await module.Compare({ key: otp, encryptedKey: user.otpPassword });
   if (!compareOtp) {
     const attemptsExceeded = await module.handleFailedAttempt(user); 
     if (attemptsExceeded.isBanned) {
       return next(
         new Error('Too many failed attempts. You are temporarily banned for 5 minutes.', { cause: 403 })
       );
     }
     return next(new Error(`Invalid OTP. You have ${attemptsExceeded.remainingAttempts} attempts remaining.`, { cause: 400 }));
   }
   await userModel.updateOne(
      { email: user.email },
      {
       password: hashPassword ,
       $unset: { otpPassword: 0, otpCreatedAt: 0, failedAttempts: 0, banExpiry: 0 },
      }
    );
   return res.status(200).json({message:"Password reset successfully"})
}


//------------------------------------------------loginConfirmation
export const loginConfirmation = async (req, res, next) => {
   const { email, otp } = req.body; 
 
  
   const user = await userModel.findOne({ email });
 
   if (!user) return next(new Error("User not found", { cause: 404 }));
   if (!user.twoStepOTP) return next(new Error("No OTP generated for this user", { cause: 400 }));
 
 
   if (await module.checkOtpExpiration(user)) {
     return next(new Error("OTP expired. Please log in again.", { cause: 400 }));
   }
 
   const isOtpValid = await module.Compare({ key: otp, encryptedKey: user.twoStepOTP });
   if (!isOtpValid) return next(new Error("Invalid OTP", { cause: 400 }));
 
   
   await userModel.updateOne(
     { email: user.email },
     {
       $unset: { twoStepOTP: 0, otpCreatedAt: 0 },
     }
   );
 
  
   const accessToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.user?process.env.ACCESS_JWT_SECRET_USER:process.env.ACCESS_JWT_SECRET_ADMIN,option:{ expiresIn: '1h' }})
   const refreshToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.user?process.env.REFRESH_JWT_SECRET_USER:process.env.REFRESH_JWT_SECRET_ADMIN,option:{ expiresIn: '1w' }})

   res.status(200).json({
     message: "2-step verification successful. Logged in successfully.",
     tokens: { accessToken, refreshToken },
   });
};



//------------------------------------------------updatePassword
export const updatePassword=async(req,res,next)=>{
   const {oldPassword,newPassword}=req.body
   const user =await userModel.findById({_id:req.user._id})
   if(!user){
      return next(new Error('User Not Found',{cause:404}))
   }
   if(user.isDeleted){
      return next(new Error('Account has been deleted', { cause: 400 }));
   }
   
   if(! await module.Compare({key:oldPassword,encryptedKey:user.password})){
      return next(new Error('Invalid Old Password', { cause: 400 }));
        
   }
 
   const hashPassword= await module.Hash({key:newPassword,SALT_ROUND:process.env.SALT_ROUND})
   const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      {
       password:hashPassword,
       changedPasswordAt:Date.now()
      },
      { new: true }
    );
 
   return res.status(200).json({message:"Password Updated successfully",user:updatedUser})
}


//------------------------------------------------getProfile
export const getProfile=async(req,res,next)=>{

  const user= await userModel.findOne({_id:req.user._id,isDeleted:false}).populate('friends')
  if(!user){
    return next(new Error("Account has been deleted Or User Not Found", { cause: 400 }));
  }
 return res.status(200).json({message:"Done",user})
}
//------------------------------------------------addFriend
export const addFriend=async(req,res,next)=>{
  const {userId}= req.params
  const user= await userModel.findByIdAndUpdate(userId,{$addToSet:{friends:req.user._id}},{new:1})
  if(!user){
    return next(new Error("Account has been deleted Or User Not Found", { cause: 400 }));
  }
  await userModel.findByIdAndUpdate(req.user._id,{$addToSet:{friends:userId}},{new:1})
 return res.status(200).json({message:"Done",user})
}
//------------------------------------------------resendOtp
export const resendOtp=async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
      return next(new Error('Email not found', { cause: 404 }));
  }

  if (user.confirmed) {
      return next(new Error('Email is already confirmed', { cause: 400 }));
  }

  module.emailEvent.emit('sendEmailConfirm', { name: user.name, email });
  return res.status(200).json({ message: "A new OTP has been sent to your email." });
}