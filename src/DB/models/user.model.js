import mongoose from "mongoose";
import { roleOptions } from "../../middleware/authorization.js";

export const genderOptions={
    male:'male',
    female:'female'
}

export const providerOptions={
    application:'application',
    google:'google'
}
const userSchema= new mongoose.Schema({
    name:{
        type: String,
        lowercase: true,
        trim: true,
        minLength: [3, 'Name must be at least 3 characters long.'],
        maxLength: [30, 'Name must be at most 30 characters long.'],
        required: [true, 'Name is required.']

    },
    email:{
        type: String,
        lowercase: true,
        required: [true, 'Email is required.'],
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address.'],
        unique:[true,'Email already Exist']
        
    },
    password:{
        type: String,
        minLength: [8, 'Password must be at least 8 characters long.'], 
        required: function(){
            return this.provider== providerOptions.application?true:false
        }
       
    },
    phone:{
        type: String,
        unique:[true,'Phone already Exist'],
        required: function(){
            return this.provider== providerOptions.application?true:false
        }
        
    },
    gender:{
        type:String,
        enum:Object.values(genderOptions),
        default:genderOptions.male,
        required: function(){
            return this.provider== providerOptions.application?true:false
        }
    },
    confirmed:{
        type:Boolean,
        default:false,
    },
    role:{
        type:String,
        enum:Object.values(roleOptions),
        default:roleOptions.user,
        
    },

    provider:{
        type:String,
        enum:Object.values(providerOptions),
        default:providerOptions.application
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
   
    profileImage:{
        public_id:String,
        secure_url:String
    },
    coverImages:[{
        public_id:String,
        secure_url:String
    }],
    isDeleted:{
        type:Boolean,
        default:false,
    },
    changedPasswordAt:Date,
    otpEmail:{
        type:String,
        
    },
    otpPassword:{
        type:String,
        
    },
    otpCreatedAt: {
        type: Date,
    },
    failedAttempts: {
        type: Number,
        default: 0,
    },
    banExpiry: {
        type: Date,
    }
   
    

},{timestamps:true})
export const connectedUsers=new Map()

export const userModel=mongoose.models.User||mongoose.model('User',userSchema)
