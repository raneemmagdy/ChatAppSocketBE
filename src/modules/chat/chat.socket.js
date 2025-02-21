import { Server } from "socket.io"
import { logOut, registerUser } from "./services/chat.socket.service.js";
import { sendMessage } from "./services/message.service.js";

export const runIo=(server)=>{
    
    const io= new Server(server,{
        cors:"*"
    })
  
    io.on('connection',async(socket)=>{
        console.log(socket.id);
        await registerUser(socket)
        await sendMessage(socket)

        await logOut(socket)
    })
}