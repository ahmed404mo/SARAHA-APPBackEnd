import nodemailer from "nodemailer"
import { EMAIL_APP_PASSWORD, EMAIL_APP, APPLICATION_NAME } from './../../../../config/config.service.js';
import joi from "joi";
import { Types } from "mongoose";

export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments=[]
}={})=>{
  const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:EMAIL_APP,
      pass:EMAIL_APP_PASSWORD
    }
  })

  const info = await transporter.sendMail({
    to,
    cc,
    bcc,
    subject,
    attachments,
    from:`"${APPLICATION_NAME} "<${EMAIL_APP}>`,
    html
  })
}



const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value) ? true : helper.message("In-valid objectId");
};

// under developement
export const generalValidationFields = {

    otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
    username: joi.string().pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z][a-z]{1,24}$/)).min(2).max(25),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 2, tlds: { allow: ['com', 'net', "edu"] } }),
    password: joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/)),
    confirmPassword: function (path = "password") {
        return joi.string().valid(joi.ref(path))
    },
    phone: joi.string(),
    flag: joi.boolean().truthy("true", "1").falsy("false", "0"),
    id: joi.string().custom((value, helper) => {
        return Types.ObjectId.isValid(value) ? true : helper.message("Invalid objectId")
    }),
    file: function (validation = []) {
        return joi.object().keys({
            "fieldname": joi.string().required(),
            "originalname": joi.string().required(),
            "encoding": joi.string().required(),
            "mimetype": joi.string().valid(...Object.values(validation)).required(),
            "finalPath": joi.string().required(),
            "destination": joi.string().required(),
            "filename": joi.string().required(),
            "path": joi.string().required(),
            "size": joi.number().required(),
        })
    }
}