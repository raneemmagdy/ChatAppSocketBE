import {userModel} from "../DB/models/index.js";
import { asyncHandler,VerifyToken } from "../utils/index.js";
export const tokenTypes={
    access:'access',
    refresh:'refresh'
}
export const decodedToken=async({authorization,tokenType,next})=>{

    if(!authorization){
        return next(new Error('Token Not Found',{cause:404}))
    }
    const [prefix,token]=authorization.split(' ')

    if(!prefix){
        return next(new Error('Token prefix not found', { cause: 404 }));
    }
    if(!token){
        return next(new Error('Token not found', { cause: 404 }));
    }
    let JWT_SECRET=undefined
    if(prefix==process.env.PREFIX_FOR_USER){
        JWT_SECRET=tokenType===tokenTypes.access?process.env.ACCESS_JWT_SECRET_USER:process.env.REFRESH_JWT_SECRET_USER
    }else if(prefix==process.env.PREFIX_FOR_ADMIN){
        JWT_SECRET=tokenType===tokenTypes.access?process.env.ACCESS_JWT_SECRET_ADMIN:process.env.REFRESH_JWT_SECRET_ADMIN
    }else{
        return next(new Error('Invalid token prefix. Unauthorized access.',{cause:400}))
    }

    const payload= await VerifyToken({token,JWT_SECRET})
    if(!payload?.email||!payload?.id){
        return next(new Error('Invalid token payload',{cause:400}))
    }
    const user= await userModel.findById({_id:payload.id})
    if(!user){
        return next(new Error('User Not Found',{cause:404})) 
    }
    if(user?.isDeleted){
        return next(new Error('User Is Deleted(Soft Delete)', { cause: 400 }));
    }
    if(parseInt(user?.changedPasswordAt?.getTime()/1000) > payload.iat){
        return next(new Error('Token has expired. Please log in again.', { cause: 400 }));
    }
    return user

}

const authentication=asyncHandler(
     async(req,res,next)=>{
        const {authorization}=req.headers
        const user=await decodedToken({authorization,tokenType:tokenTypes.access,next})
        req.user=user
        next()
     }
)


export const authSocket=async({socket,tokenType=tokenTypes.access})=>{

    const {authorization}=socket.handshake.auth
    if(!authorization){
        return {message:'Token Not Found',statusCode:404}
    }
    const [prefix,token]=authorization.split(' ')

    if(!prefix){
        return {message:'Token prefix not found', statusCode: 404 };
    }
    if(!token){
        return {message:'Token not found', statusCode: 404 };
    }
    let JWT_SECRET=undefined
    if(prefix==process.env.PREFIX_FOR_USER){
        JWT_SECRET=tokenType===tokenTypes.access?process.env.ACCESS_JWT_SECRET_USER:process.env.REFRESH_JWT_SECRET_USER
    }else if(prefix==process.env.PREFIX_FOR_ADMIN){
        JWT_SECRET=tokenType===tokenTypes.access?process.env.ACCESS_JWT_SECRET_ADMIN:process.env.REFRESH_JWT_SECRET_ADMIN
    }else{
        return {message:'Invalid token prefix. Unauthorized access.',statusCode:400}
    }

    const payload= await VerifyToken({token,JWT_SECRET})
    if(!payload?.email||!payload?.id){
        return {message:'Invalid token payload',statusCode:400}
    }
    const user= await userModel.findById({_id:payload.id})
    if(!user){
        return {message:'User Not Found',statusCode:404} 
    }
    if(user?.isDeleted){
        return {message:'User Is Deleted(Soft Delete)',statusCode: 400 };
    }
    if(parseInt(user?.changedPasswordAt?.getTime()/1000) > payload.iat){
        return {message:'Token has expired. Please log in again.', statusCode: 400 };
    }
    return {user,statusCode:200}

}
export default authentication