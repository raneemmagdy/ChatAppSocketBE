import cors from 'cors'
import path from 'path'
import checkDBConnection from './DB/connectionDB.js'
import userRouter from './modules/user/user.controller.js'
import { globalErrorHandling } from './utils/index.js'
import {rateLimit} from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import chatRouter from './modules/chat/chat.controller.js'

const limiter=rateLimit({
    limit:5,
    windowMs:60*1000,
    handler:(req,res,next)=>{
        return next(new Error('Too many requests. Please slow down and try again later.',{cause:429}))
    }

})
const bootstrap=(app,express)=>{
    app.use(morgan('dev'))
    app.use(helmet())
    app.use(cors())
    app.use(limiter)
    app.use('/uploads',express.static(path.resolve('uploads')))

    app.use(express.json())
    checkDBConnection()
    app.use('/users',userRouter)
    app.use('/chat',chatRouter)

    app.get('/',(req,res,next)=>{
        return res.status(200).json({message:"Welcome To My Social Media App"})
    })
    app.use('*',(req,res,next)=>{
        return next(new Error('Page Not Found 404 !',{cause:404}))
    })
    app.use(globalErrorHandling)


}
export default bootstrap