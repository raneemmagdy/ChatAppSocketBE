import { Router } from "express";
import authentication from "../../middleware/authentication.js";
import { getChat } from "./services/chat.service.js";
import { asyncHandler } from "../../utils/index.js";


const chatRouter=Router()
chatRouter.get('/:userId',authentication,asyncHandler(getChat))


export default chatRouter