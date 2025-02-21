import CryptoJS from "crypto-js";

export const Decrypt=async({key,SECRET_KEY})=>{
    return CryptoJS.AES.decrypt(key,SECRET_KEY).toString(CryptoJS.enc.Utf8)
}
