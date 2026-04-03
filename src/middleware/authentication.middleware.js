import { tokenTypeEnum } from "../common/enums/security.enum.js";
import { forbiddenExpeption, unauthorizedExpeption } from "../common/utils/index.js";
import { decodeToken } from "../common/utils/security/token.security.js";

export const authentication = (tokenType = tokenTypeEnum.access) => {
  return async (req, res, next) => {
    try {
      const [key, credential] = req.headers?.authorization?.split(" ") || [];
      console.log({ key, credential });

      if (!key || !credential|| credential === 'null' || credential === 'undefined') {
        throw  unauthorizedExpeption({ message: 'Missing authorization' });
      }

      switch (key) {
        case 'Basic':
          const [username, password] = Buffer.from(credential, 'base64').toString().split(":");
          console.log({ username, password });
          break;

        default:
          const { user, decoded } = await decodeToken({ token: credential, tokenType });
          req.user = user;
          req.decoded = decoded;
          break;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorization = (accessRoles = []) => {
  return (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      throw  forbiddenExpeption({ message: "You don't have permission" });
    }
    next();
  };
};