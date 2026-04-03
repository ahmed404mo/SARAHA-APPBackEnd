import { EventEmitter } from 'node:events'
import { EmailEnum } from '../../enums/email.enum.js'
export const emailEmitter = new EventEmitter()

emailEmitter.on(EmailEnum.ConfirmEmail, async (emailFunction) => {

  try {
await emailFunction()

  } catch (error) {
    console.log(`Fail to send user email ${error}`);
    
  }

})

// forgotPassword

emailEmitter.on(EmailEnum.ForgotPassword, async (emailFunction) => {
  try {
    await emailFunction()
  } catch (error) {
    console.log(`Fail to send forgot password email ${error}`);
  }
})