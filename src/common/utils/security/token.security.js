import jwt from "jsonwebtoken";
import {
  System_TOKEN_SECRET_KEY,
  USER_TOKEN_SECRET_KEY,
  System_REFRESH_TOKEN_SECRET_KEY,
  USER_REFRESH_TOKEN_SECRET_KEY,
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
} from "../../../../config/config.service.js";
import { randomUUID } from 'node:crypto';
import { RoleEnum, AudienceEnum, tokenTypeEnum } from "../../enums/index.js";
import { get, revokeTokenKey } from './../../services/radis.service.js';
import { UserModel } from "../../../DB/index.js";
import { unauthorizedExpeption, NotFoundExpeption } from "../index.js";

export const generateToken = async ({
  payload = {},
  secret = USER_TOKEN_SECRET_KEY,
  options = {},
} = {}) => {
  return jwt.sign(payload, secret, options);
};

export const getTokenSignature = async (role) => {
  let accessSignature = undefined;
  let refreshSignature = undefined;
  let audience = AudienceEnum.User;
  switch (role) {
    case RoleEnum.Admin:
      accessSignature = System_TOKEN_SECRET_KEY;
      refreshSignature = System_REFRESH_TOKEN_SECRET_KEY;
      audience = AudienceEnum.System;
      break;

    default:
      accessSignature = USER_TOKEN_SECRET_KEY;
      refreshSignature = USER_REFRESH_TOKEN_SECRET_KEY;
      audience = AudienceEnum.User;
      break;
  }
  return { accessSignature, refreshSignature, audience };
};

export const createLoginCredentiels = async (userInfo, issuer) => {
  const { accessSignature, refreshSignature, audience } = await getTokenSignature(userInfo.role);
  const jwtid = randomUUID();
  
  const access_token = await generateToken({
    payload: { sub: userInfo._id },
    secret: accessSignature,
    options: {
      issuer,
      audience: [tokenTypeEnum.access, audience],
      expiresIn: ACCESS_EXPIRES_IN,
      jwtid
    }
  });

  const refresh_token = await generateToken({
    payload: { sub: userInfo._id },
    secret: refreshSignature,
    options: {
      issuer,
      audience: [tokenTypeEnum.refresh, audience],
      expiresIn: REFRESH_EXPIRES_IN,
      jwtid
    }
  });

  return { access_token, refresh_token };
};

export const decodeToken = async ({ token, tokenType = tokenTypeEnum.access }) => {
  const secret = tokenType === tokenTypeEnum.access
    ? USER_TOKEN_SECRET_KEY
    : USER_REFRESH_TOKEN_SECRET_KEY;

  const decoded = jwt.verify(token, secret);

  if (!decoded.jti || await get(revokeTokenKey({ userId: decoded.sub, jti: decoded.jti }))) {
    throw unauthorizedExpeption({ message: "Invalid token payload or token revoked" });
  }

  const user = await UserModel.findById(decoded.sub);
  if (!user) {
    throw NotFoundExpeption({ message: "User not found" });
  }

  if (user.changeCredentialsTime) {
    const time = parseInt(user.changeCredentialsTime.getTime() / 1000);
    if (time > decoded.iat) {
      throw unauthorizedExpeption({ message: "Token expired due to credentials change" });
    }
  }

  return { user, decoded };
};