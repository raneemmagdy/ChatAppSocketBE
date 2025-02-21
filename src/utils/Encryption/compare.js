import bcrypt from 'bcrypt'

export const Compare=async({key,encryptedKey})=>{
    return bcrypt.compareSync(key,encryptedKey)
}
