import { REFRESH_EXPIRES_IN } from "../../../config/config.service.js";
import { logoutEnum } from "../../common/enums/user.enum.js";
import { set,revokeTokenKey, deleteKey, keys, baseRevokTokenKey } from "../../common/services/index.js";
import { compareHash, conflictExpeption, generateHash } from "../../common/utils/index.js";
import { createLoginCredentiels } from "../../common/utils/security/token.security.js";
import {  deleteMany, findById, UserModel } from "../../DB/index.js";

export const profile = async (id) => {

  const user = await findById({
    model:UserModel,
    id,
    
  })
  return user;
};
export const logout = async ({flag},user,{jti,iat, sub}) => {
let status = 200
switch (flag) {
  case logoutEnum.All:
    user.changeCredentialsTime = new Date()
    await user.save()
    await deleteKey(await keys (baseRevokTokenKey(sub)))
    break;

  default:
    await set({
      key:revokeTokenKey({userId:sub, jti}),
      value:jti,
      ttl:iat + REFRESH_EXPIRES_IN
    })
    status=201
    break;
}
return status
};



export const updateProfile = async (id,inputs) => {
  const {lastName , gender, phone} = inputs
  const user = await UserModel.updateOne({ _id: id },
    {
      $set:{lastName, gender}
      ,
      // $unset:{
      //   phones:1
      // }
      // $push:{
      //   phones:phone
      // }
$addToSet:{
  phones:phone
},
$inc:{
  __v:1
}
    },{
      upsert:true,
      new:true,
      runValidators:true
    })
  return user;
};

export const deleteProfile = async (id,inputs) => {
  const {lastName , gender, phone} = inputs
  const user = await UserModel.updateOne({ _id: id },
    {
      $set:{lastName, gender}
      ,
      // $unset:{
      //   phones:1
      // }
      // $push:{
      //   phones:phone
      // }
$addToSet:{
  phones:phone
},
$inc:{
  __v:1
}
    },{
      upsert:true,
      new:true,
      runValidators:true
    })
  return user;
};


export const updatePassword = async ({oldPassword, password},issuer, user)=>{
if (!await compareHash({plainText:oldPassword,cipherText:user.password})) {
  throw conflictExpeption("Invalid old password");
}

// for (const hash of user.oldPassword || []) {
// if (await compareHash({plainText:password ,cipherText:hash})) {
//   throw conflictExpeption("Sorry this password is weak you have already used it before!!")
// }
// }
user.oldPassword.push(user.password)
user.password = await generateHash({plainText:password})
user.changeCredentialsTime = new Date()
await user.save()
await deleteKey(await keys(baseRevokTokenKey(user._id)))
return await createLoginCredentiels(user, issuer)
}