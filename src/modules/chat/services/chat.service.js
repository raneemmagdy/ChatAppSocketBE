import { chatModel, userModel } from "../../../DB/models/index.js";

export const getChat=async(req,res,next)=>{
    const {userId}=req.params
    const user= await userModel.findById(userId)
    if(!user){
        return next(new Error("Account has been deleted Or User Not Found", { cause: 400 }));
    }
    const chat = await chatModel.findOne({
        $or:[
            {mainUser:req.user._id,subParticipant:userId},
            {subParticipant:req.user._id,mainUser:userId}
        ]
    }).populate('subParticipant mainUser messages.senderId')
   return res.status(200).json({message:"done",chat})
}