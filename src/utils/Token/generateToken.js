import jwt from 'jsonwebtoken'
export const GenerateToken=async({payload={},JWT_SECRET,option})=>{
    return jwt.sign(payload,JWT_SECRET,option)
}
