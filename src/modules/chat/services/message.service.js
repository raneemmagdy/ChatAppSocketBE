import { chatModel, connectedUsers } from "../../../DB/models/index.js";
import { authSocket } from "../../../middleware/authentication.js";

export const sendMessage=async(socket)=>{
    socket.on('sendMessage',async(messageInfo)=>{
        console.log(messageInfo);
        const data=await authSocket({socket})
        if (data.statusCode!=200) {
            return socket.emit('authError',data)         
        }
        const userId=data.user._id
        let chat;
        chat = await chatModel.findOneAndUpdate({
            $or:[
                {mainUser:userId,subParticipant:messageInfo.destId},
                {subParticipant:userId,mainUser:messageInfo.destId}
            ]
        },
        {
            $push:{messages:{senderId:userId,message:messageInfo.message}}
        },
        {new:1}
    )

    if(!chat){
        chat =await chatModel.create({
            mainUser:userId,
            subParticipant:messageInfo.destId,
            messages:[{senderId:userId,message:messageInfo.message}]
        })
    }


    socket.emit("successMessage",{message:messageInfo.message})
    socket.to(connectedUsers.get(messageInfo.destId.toString())).emit("receiveMessage",{message:messageInfo.message})

    })
}