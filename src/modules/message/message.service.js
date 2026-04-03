import { NotFoundExpeption } from "../../common/utils/response/error.response.js"
import { createOne, deleteOne, find, findOne } from "../../DB/database.repository.js"
import { MessageModel, UserModel } from "../../DB/index.js"
import {confirmEmail} from '../auth/auth.service.js'

export const getAllMessages = async ( user)=>{
  const messages = await find({model:MessageModel, filter:{
    $or:[
      {senderId:user._id},
      {receiverId:user._id},

    ],
}
})

return messages
}
export const sendMessage = async (receiverId, files=[], {content }, user)=>{
  const receiver = await findOne({
    model:UserModel,
    filter:{
      _id:receiverId,
      confirmEmail:{$exists:true}
    }
  })
  if (!receiver) {
    throw NotFoundExpeption({message:"No matching account"})
  }
  const message = await createOne({
    model:MessageModel,
    data:{
      content,
      attachments:files.map(file=>file.path)||[],
      receiverId,
      senderId:user?user._id:undefined
    }
  })
return message
}
export const getMessageById = async (messageId, user)=>{
  const message = await findOne({model:MessageModel, filter:{
    _id:messageId,
    $or:[
      {senderId:user._id},
      {receiverId:user._id},

    ],
  },
  seleck:"-senderId"
})
  if (!message) {
    throw NotFoundExpeption({message:"invalid messageId or not autherized action"})
  }
return message
}
export const deleteMessageById = async (messageId, user)=>{
  const message = await deleteOne({model:MessageModel, filter:{
    _id:messageId,
 receiverId:user._id,
}
})
  if (!message.deletedCount) {
    throw NotFoundExpeption({message:"invalid messageId or not autherized action"})
  }
return message
}
