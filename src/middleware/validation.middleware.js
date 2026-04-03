import jwt from 'jsonwebtoken';
import { badRequestExpeption, NotFoundExpeption } from './../common/utils/response/error.response.js';
import { findOne } from "../DB/database.repository.js";
import { UserModel } from "../DB/index.js";
import { USER_TOKEN_SECRET_KEY } from '../../config/config.service.js';

export const validation = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    for (const key of Object.keys(schema)) {
      const dataToValidate = req[key]; 
      
      if (schema[key]) {
        const validationResult = schema[key].validate(dataToValidate, { abortEarly: false });

        if (validationResult.error) {
          const errorMessages = validationResult.error.details.map(err => err.message).join(", ");
          validationErrors.push(errorMessages);
        }
      }
    }

    if (validationErrors.length > 0) {
return next(badRequestExpeption({ message: validationErrors.join(", ") }));
    }
    
    next();
  };
};

export const auth = () => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      
      if (!authorization || !authorization.startsWith("Bearer ")) {
         throw badRequestExpeption({message:"Token is missing or invalid format"});
      }

      const token = authorization.split(" ")[1];
      const decoded = jwt.verify(token, USER_TOKEN_SECRET_KEY);

      if (!decoded || !decoded.sub) {
        throw badRequestExpeption({message:"Invalid token"});
      }

      const user = await findOne({
        model: UserModel,
        filter: { _id: decoded.sub }
      });

      if (!user) {
     throw NotFoundExpeption({message:"Not registered account"});
      }
      
      req.user = user;
      req.decoded = decoded;
      
      return next(); 
    } catch (error) {
      return next(error);
    }
  };
};