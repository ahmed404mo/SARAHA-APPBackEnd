# Saraha App BackEnd (Node.js, Express, MongoDB, Redis)

A messaging backend API built with Express.js, MongoDB (Mongoose), and Redis for rate limiting and caching. Includes user authentication, email verification, password reset flow, file uploads, and JWT-based authorization.

## 🚀 Features

- User signup, login (JWT)
- Email confirmation and resend confirmation
- Forgot password request, verify code, reset password
- User profile fetch/update, logout
- Password update
- Message CRUD: create, list, get by id, delete
- File uploads for profile and message attachments
- Security middleware: CORS, Helmet, rate-limiter
- Redis connection for throttling and active session state
- Global error handling middleware

## 🧩 Tech Stack

- Node.js 24.x
- Express 5.x
- MongoDB via Mongoose
- Redis (via `redis` package)
- JWT (`jsonwebtoken`)
- Validation (`joi`)
- File uploads (`multer`)
- Email via `nodemailer`

## 📁 Project structure

- `src/main.js` - entry point
- `src/bootstrap.app.js` - app initialization, routes, middleware
- `src/modules/auth/*` - auth routes, controllers, services
- `src/modules/user/*` - user endpoints
- `src/modules/message/*` - messaging endpoints
- `src/DB` - DB and Redis connection
- `config/.env.dev` - environment configuration

## ⚙️ Installation

```bash
git clone https://github.com/ahmed404mo/SARAHA-APPBackEnd.git
cd folderStruchure
npm install
```

## 📝 Environment Variables

Copy `config/.env.dev` to `config/.env` or update as needed. Required keys:

- `DB_URI` (MongoDB connection URI)
- `RUDIS_URI` (Redis connection URI)
- `SALT_ROUND` (bcrypt / argon2 salt rounds)
- `APPLICATION_NAME`
- `ENC_BYTE`
- `USER_TOKEN_SECRET_KEY`
- `USER_REFRESH_TOKEN_SECRET_KEY`
- `System_TOKEN_SECRET_KEY`
- `System_REFRESH_TOKEN_SECRET_KEY`
- `ACCESS_EXPIRES_IN` (seconds)
- `REFRESH_EXPIRES_IN` (seconds)
- `EMAIL_APP_PASSWORD`
- `EMAIL_APP`
- `ORIGINS` (comma-separated allowed origins)

## ▶️ Start the app

```bash
npm run start:dev
```

Default port: `3000` (or `process.env.PORT`).

## 📡 API Endpoints

### Auth (`/auth`)

- `POST /auth/signup`
- `POST /auth/login`
- `PATCH /auth/confirm-email`
- `PATCH /auth/resend-confirm-email`
- `POST /auth/request-forgot-password-code`
- `PATCH /auth/verify-forgot-password-code`
- `PATCH /auth/reset-forgot-password-code`

### User (`/user`)

- `GET /user/:userId` - get user profile
- `PATCH /user/:userId` - update profile
- `PATCH /user/password` - update password (requires auth)
- `POST /user/logout` - logout (requires auth)
- `PATCH /user/profile-image` - upload profile image

### Message (`/message`)

- `GET /message/list` - list messages (requires auth)
- `POST /message/:receiverId` - send message (`content` or attachments required)
- `GET /message/:messageId` - get message by id (requires auth)
- `DELETE /message/:messageId` - delete message (requires auth)

## 🔐 Auth flow

- JWT token is expected in `Authorization: Bearer <token>` for protected routes.
- `message` POST route optionally accepts token; if present, message sent by authenticated user.

## 📂 File uploads

- Profile image: `PATCH /user/profile-image`, field: `attachment`
- Message attachments: `POST /message/:receiverId`, field: `attachments` (max 2 files, image validation)

## 🧪 Notes

- Errors are normalized by `globalErrorHandling` middleware.
- Rate-limiting is active on `POST /auth/login`.

## 💡 Improvements

- Add tests (Jest/Mocha).
- Add Swagger documentation.
- Production-ready env management (do not commit credentials).
- Add logging and monitoring.
