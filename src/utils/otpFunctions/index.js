import { userModel } from "../../DB/models/index.js";

export const checkIfBanned = async(user) => {
    const currentTime = Date.now();
    return user.banExpiry && currentTime < user.banExpiry;
};

export const checkOtpExpiration = async(user) => {
    if (!user.otpCreatedAt) {
      return true; 
    }
    const currentTime = Date.now(); 
    
    const otpTime = new Date(user.otpCreatedAt).getTime(); 

    return currentTime > otpTime + 2 * 60 * 1000; 

    
};
export const handleFailedAttempt = async (user) => {
    const maxAttempts = 5; 
    const failedAttempts = (user.failedAttempts || 0) + 1;
    const remainingAttempts = maxAttempts - failedAttempts; 
  
    if (failedAttempts >= maxAttempts) {
      await userModel.updateOne(
        { email: user.email },
        { banExpiry: Date.now() + 5 * 60 * 1000, failedAttempts: 0 }
      );
      return { isBanned: true, message: "Too many failed attempts. You are temporarily banned for 5 minutes." };
    }
  
    await userModel.updateOne({ email: user.email },  { failedAttempts } );
   
    return {
      isBanned: false,
      remainingAttempts,
      message: `Invalid OTP. You have ${remainingAttempts} attempts remaining.`,
    };
};
  
