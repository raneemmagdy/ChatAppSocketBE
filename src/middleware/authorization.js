import { asyncHandler } from "../utils/index.js"

export const roleOptions={
    user:'user',
    admin:'admin',
    superAdmin:'superAdmin'
}

const authorization=(accessRoles=[])=>{
    return asyncHandler(
         async(req,res,next)=>{
            if(!accessRoles.includes(req.user.role)){
                return next(new Error('Access denied: You do not have the required permissions.',{cause:403}))
            }
            next()
         }
       )
    }
export default authorization
