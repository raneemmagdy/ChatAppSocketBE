import multer from "multer"
import { nanoid } from "nanoid"
import path from 'path'
import fs from 'fs'
export const formatOptions={
    image:['image/png','image/jpeg','image/gif','image/jpg','image/jfif'],
    video: ['video/mp4', 'video/mkv', 'video/avi'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    pdf:['application/pdf']

}
export const multerLocal=(customValidation=[],customPath='generals')=>{

    const fullPath= path.resolve(`uploads/${customPath}`)
    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath,{recursive: true})
    }
    const storage= multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,fullPath)
        },
        filename:(req,file,cb)=>{
            cb(null,nanoid(4)+file.originalname)
        }
    })
    function fileFilter (req, file, cb) {
        if(customValidation.includes(file.mimetype)){
            cb(null,true)
        }else{
            cb(new Error('invalid extention format'),false)
        }
    }
    const upload=multer({storage,fileFilter})
    return upload

}
export const multerHost=(customValidation=[])=>{

    const storage= multer.diskStorage({})
    function fileFilter (req, file, cb) {
        console.log("Uploaded file MIME type:", file.mimetype);
        if(customValidation.includes(file.mimetype)){
            cb(null,true)
        }else{
            cb(new Error('invalid extention format'),false)
        }
    }
    const upload=multer({storage,fileFilter})
    return upload

}