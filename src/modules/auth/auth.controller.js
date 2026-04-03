import { Router } from "express";
import {
  badRequestExpeption,
  successResponse,
} from "../../common/utils/index.js";
import * as validators from "./auth.validation.js";
import { validation } from "./../../middleware/index.js";
import {
  login,
  Signup,
  confirmEmail,
  resendConfirmEmail,
  requestForgotPasswordCode,
  resetForgotPasswordCode,
  verifyForgotPasswordCode,
  
} from "./auth.service.js";
import {  limiterLogin } from "../../middleware/limiter.js";
import { deleteKey } from "../../common/services/radis.service.js";

const router = Router();




router.patch(
  "/confirm-email",
  validation(validators.confirmEmail),
  async (req, res, next) => {
    const account = await confirmEmail(req.body);
    return successResponse({ res });
  },
);

router.patch(
  "/resend-confirm-email",
  validation(validators.reSendConfirmEmail),
  async (req, res, next) => {
    const account = await resendConfirmEmail(req.body);
    return successResponse({ res });
  },
);


router.post(
  "/request-forgot-password-code", 
  validation(validators.verifyEmail),
  async (req, res, next) => {
    await requestForgotPasswordCode(req.body)
  return successResponse({ res, status: 201 });
});

router.patch(
  "/verify-forgot-password-code", 
  validation(validators.verifyForgotPasswordCode),
  async (req, res, next) => {
    await verifyForgotPasswordCode(req.body)
  return successResponse({ res, status: 201 });
});

router.patch(
  "/reset-forgot-password-code", 
  validation(validators.resetForgotPasswordCode),
  async (req, res, next) => {
    await resetForgotPasswordCode(req.body)
  return successResponse({ res, status: 201 });
});

router.post(
  "/signup",
  validation(validators.signup),
  async (req, res, next) => {
    const account = await Signup(req.body);
    return successResponse({ res, status: 201, data: { account } });
  },
);

router.post("/login",limiterLogin, validation(validators.login), async (req, res, next) => {
  const account = await login(req.body);
  await deleteKey(`${req.ip}-${req.path}`)
  return successResponse({ res, status: 200, data: { ...account } });
});

export default router;
