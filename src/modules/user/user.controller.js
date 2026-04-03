import { Router } from "express";
import { logout, profile, updatePassword, updateProfile } from "./user.service.js";
import { successResponse } from "../../common/utils/index.js";
import { fileFieldValidation, localFileUpload } from "../../common/utils/multer/index.js";
import * as authentication from "./../../middleware/index.js"
import { validation } from './../../middleware/validation.middleware.js';
import * as validators from "./../auth/auth.validation.js";

const router = Router()


router.patch(
  "/password",
  authentication.auth(),
  validation(validators.updatePassword),
  async(req,res,next)=>{
    const credentails = await updatePassword(req.body, "Saraha_App",req.user)
    return successResponse({res, data:{...credentails}})
  }
)


router.post("/logout",authentication.auth() ,async (req, res, next)=>{
  try {
    
    const account = await logout(req.body, req.user, req.decoded)
    return successResponse({res, account})
  } catch (error) {
    
    next(error)
  }
} )

router.patch("/profile-image",localFileUpload({
  customPath:"users/profile",
  // validation:[...fileFieldValidation.image,fileFieldValidation.video[0]]
  validation:fileFieldValidation.image,
  maxSize:7
}).single("attachment"),async(req,res,next)=>{
  return successResponse({res,data:{File:req.file}})
})

router.get("/:userId",async (req,res,next)=>{
  const account = await profile(req.params.userId)
  return successResponse({res, data:{account}})

})

router.patch("/:userId",async (req,res,next)=>{
  const result = await updateProfile(req.params.userId, req.body)
  return res.status(200).json({message:"Profile",result})

})


export default router