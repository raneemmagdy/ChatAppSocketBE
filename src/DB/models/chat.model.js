
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    
    mainUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    subParticipant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
   messages: [{
       message:{type:String,required:true},
       senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
       }
    }],
  
}, { timestamps: true });

export const chatModel = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
