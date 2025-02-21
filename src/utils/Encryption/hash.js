import bcrypt from 'bcrypt'

export const Hash=async({key,SALT_ROUND=process.env.SALT_ROUND})=>{
    return bcrypt.hashSync(key,Number(SALT_ROUND))
}
