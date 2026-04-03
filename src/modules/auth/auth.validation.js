import joi from 'joi';
import { generalValidationFields } from '../../common/utils/email/send.email.js';

export const signup = {
  body: joi.object().keys({
    username: joi.string().pattern(new RegExp(/^[A-z]{1}[a-z]{1,24}\s[A-z]{1}[a-z]{1,24}/)).required(),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'edu', 'net'] } }).required(),
    password: joi.string().pattern(new RegExp(/^(?=.*[a-z]){1,}(?=.*[A-Z]){1,}(?=.*\d){1,}(?=.*\w){1,}[\w\W\d].{8,28}$/)),
    confirmPassword: joi.string().valid(joi.ref("password")),
    phone: joi.string().required()
  }).required()
};

export const login = {
  body: joi.object().keys({
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'edu', 'net'] } }).required(),
    password: joi.string().pattern(new RegExp(/^(?=.*[a-z]){1,}(?=.*[A-Z]){1,}(?=.*\d){1,}(?=.*\w){1,}[\w\W\d].{8,28}$/)),
  }).required()
};

export const verifyEmail = {
  body: joi.object().keys({
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'edu', 'net'] } }).required(),
  }).required()
};

export const verifyForgotPasswordCode = {
  body: verifyEmail.body.append({
    otp: generalValidationFields.otp.required()
  }).required()
};

export const resetForgotPasswordCode = {
  body: verifyForgotPasswordCode.body.append({
    password: generalValidationFields.password.required(),
    confirmPassword: generalValidationFields.confirmPassword("password").required()
  }).required()
};

export const confirmEmail = {
  body: joi.object().keys({
    email: generalValidationFields.email.required(),
    otp: generalValidationFields.otp.required()
  }).required()
};

export const reSendConfirmEmail = {
  body: joi.object().keys({
    email: generalValidationFields.email
  }).required()
};

export const updatePassword = {
  body: joi.object().keys({
    oldPassword: generalValidationFields.password.required(),
    password: generalValidationFields.password.not(joi.ref("oldPassword")).required(),
    confirmPassword: generalValidationFields.confirmPassword("password").required()
  }).required()
};