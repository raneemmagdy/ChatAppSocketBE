import jwt from 'jsonwebtoken'
export const VerifyToken=async({token,JWT_SECRET})=>{
    return jwt.verify(token,JWT_SECRET)
}
