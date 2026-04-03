import {
  compareHash,
  conflictExpeption,
  encrypt,
  NotFoundExpeption,
} from "../../common/utils/index.js";
// impotr bycrpt
import { createOne, findOne, findOneAndUpdate } from "../../DB/index.js";
import { UserModel } from "../../DB/models/index.js";
import { generateHash } from "./../../common/utils/index.js";
import { createLoginCredentiels } from "../../common/utils/security/token.security.js";
import { ProviderEnum } from "../../common/enums/user.enum.js";
import {
  ttl,
  set,
  get,
  increment,
  keys,
  deleteKey,
  revokeTokenKey,
  baseRevokTokenKey,
} from "../../common/services/radis.service.js";
import { sendEmail } from "../../common/utils/email/send.email.js";
import { emailEmitter } from "./../../common/utils/email/index.js";
import { EmailEnum } from "../../common/enums/index.js";

const createNumberOtp = async () => {
return Math.floor(100000 + Math.random() * 900000).toString();
};

const otpKey = ({ email, type = EmailEnum.ConfirmEmail }) => {
  return `OTP::User::${email}::${type}`;
};
const otpMaxRequestKey = ({ email, type = EmailEnum.ConfirmEmail }) => {
  return `${otpKey({ email, type })}::Request`;
};
const otpBlockKey = ({ email, type = EmailEnum.ConfirmEmail }) => {
  return `${otpKey({ email, type })}::Block::Request`;
};

const emailTemplate = ({ code, title }) => {
  return `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2>${title}</h2>
      <p>Your confirmation code is:</p>
      <h1 style="color: #4CAF50; letter-spacing: 5px;">${code}</h1>
    </div>
  `;
};

//  generate code
const verifyEmailOtp = async ({
  email,
  subject = EmailEnum.ConfirmEmail,
  title = "Verify Account",
} = {}) => {
  // check block condition
  const blockKey = otpBlockKey({ email, type: subject });
  const remainingBlockTime = await ttl(blockKey);

  if (remainingBlockTime > 0) {
    throw conflictExpeption(
      {message:`You have reached max request trial count please try again later after ${remainingBlockTime} seconds`},
    );
  }

const oldKey = otpKey({ email, type: subject });
const oldCodeTTL = await ttl(oldKey);
  if (!oldCodeTTL) {
    throw conflictExpeption({message:`Sorry we cannot send new otp until first one expires please try again after ${oldCodeTTL}`})
  }
  // check max trial count
  const maxTrailCount = otpMaxRequestKey({ email, type: subject });
  const checkMaxOtpRequest = Number((await get(maxTrailCount)) || 0);

  if (checkMaxOtpRequest >= 3) {
    await set({
      key: otpBlockKey({ email, type: subject }),
      value: 0,
      ttl: 300,
    });

    throw conflictExpeption(
      {message:"You have reached max request trial count please try again later after 300 seconds"},
    );
  }

  const code = await createNumberOtp();
  await set({
    key: otpKey({ email, type: subject }),
    value: await generateHash({ plainText: `${code}` }),
    ttl: 120,
  });



  await sendEmail({
    to: email,
    subject,
    html: emailTemplate({ code, title }),
  });
    checkMaxOtpRequest > 0
    ? await increment(maxTrailCount)
    : await set({ key: maxTrailCount, value: 1, ttl: 300 });
  return;
};

// Signup
export const Signup = async (inputs) => {
  const { username, email, password, phone } = inputs;
  const checkUserExist = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (checkUserExist) {
    throw conflictExpeption("Email alredy is Exist");
  }
  const user = await createOne({
    model: UserModel,
    data: {
      username,
      email,
      password: await generateHash({ plainText: password }),
      phone: await encrypt(phone),
    },
  });

  emailEmitter.emit(EmailEnum.ConfirmEmail, async () => {
    await verifyEmailOtp({ email });
  });

  return user;
};

// confirmEmail
export const confirmEmail = async (inputs) => {
  const { email, otp } = inputs;
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      provider: ProviderEnum.System,
    },
  });

  if (!account) {
    throw NotFoundExpeption({message:"fail to matching account"});
  }
  const hashOtp = await get(otpKey({ email }));
  if (!hashOtp) {
    throw NotFoundExpeption("Expired otp");
  }
  if (!(await compareHash({ plainText: otp, cipherText: hashOtp }))) {
    throw conflictExpeption({message:"Invalid otp"});
  }
  account.confirmEmail = new Date();
  await account.save();
  await deleteKey(await keys(otpKey({ email })));

  return;
};

// resend confirm email
export const resendConfirmEmail = async (inputs) => {
  const { email, otp } = inputs;
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      provider: ProviderEnum.System,
    },
  });

  if (!account) {
    throw NotFoundExpeption({message:"fail to matching account"});
  }
  const timeToLift = await ttl(otpKey({ email }));
  // if (timeToLift > 0) {
  //   throw conflictExpeption(
  //     `Sorry we cannot provide new otp until exist one is expired you can try again later after ${timeToLift}`,
  //   );
  // }
  await verifyEmailOtp({ email });
  // await deleteKey(await keys(otpKey({ email })));
  return;
};

// Login
export const login = async (inputs) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: UserModel,
    filter: { email },
    // select:"-password",
    options: {
      lean: true,
    },
  });
  if (!user) {
    throw NotFoundExpeption({message:"invalid login"});
  }
  const match = await compareHash({
    plainText: password,
    cipherText: user.password,
  });
  if (!match) {
    throw NotFoundExpeption({message:"invalid login"});
  }
  const { access_token, refresh_token } = await createLoginCredentiels(
    user,
    "Saraha_App",
  );
  return { access_token, refresh_token };
};

// Forgot-Password
export const requestForgotPasswordCode = async ({ email }) => {
  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.System,
    },
  });
  if (!account) {
    throw NotFoundExpeption({message:"invalid account"});
  }
    await verifyEmailOtp({ email, subject: EmailEnum.ForgotPassword });

  return;
};

export const verifyForgotPasswordCode = async ({ email, otp }) => {
  const hashOtp = await get(otpKey({email, type:EmailEnum.ForgotPassword}))
  if (!hashOtp) {
    throw NotFoundExpeption({message:"Expired otp"})
  }
  if (!await compareHash({plainText:otp, cipherText:hashOtp})) {
    throw conflictExpeption({message:"invalid otp"})
  }
  return;
};

export const resetForgotPasswordCode = async ({ email, otp,password }) => {
await verifyForgotPasswordCode({email, otp})
const account = await findOneAndUpdate({
  model:UserModel,
      filter: {
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.System,
    },
    update:{
      password:await generateHash({plainText:password}),
      changeCredentialsTime:new Date()
    }
})
if (!account) {
  throw NotFoundExpeption("invalid account ")
}

const otpKeys = await keys(otpKey({email, type:EmailEnum.ForgotPassword}))
const tokenKeys = await revokeTokenKey(account._id)
deleteKey([...otpKeys, ...tokenKeys])

  return;
};


