dotenvConfig({ path: resolve("./config/.env.dev") });

import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";


export const DB_URI = process.env.DB_URI;
export const ENC_BYTE = process.env.ENC_BYTE;
export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
// Number(process.env.SALT_ROUND);

export const USER_TOKEN_SECRET_KEY = process.env.USER_TOKEN_SECRET_KEY;
export const USER_REFRESH_TOKEN_SECRET_KEY = process.env.USER_REFRESH_TOKEN_SECRET_KEY;
export const System_TOKEN_SECRET_KEY = process.env.System_TOKEN_SECRET_KEY;
export const System_REFRESH_TOKEN_SECRET_KEY = process.env.System_REFRESH_TOKEN_SECRET_KEY;

export const ACCESS_EXPIRES_IN = parseInt(process.env.ACCESS_EXPIRES_IN)
export const REFRESH_EXPIRES_IN = parseInt(process.env.REFRESH_EXPIRES_IN)
export const RUDIS_URI = process.env.RUDIS_URI

export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD
export const EMAIL_APP = process.env.EMAIL_APP
export const APPLICATION_NAME = process.env.APPLICATION_NAME
export const ORIGINS = process.env.ORIGINS.split(",")


// export default config;
