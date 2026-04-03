export const globalErrorHandling = (error, req, res, next) => {
  return res.status(error.cause?.status ?? 500).json({
    error,
    error_message: error.message ?? "something went wrong",
    extra: error.cause?.extra,
    stack: error.stack,
  });
}

// general customized error method
export const ErrorResponse = ({ message = "Error", status = 400, extra = undefined } = {}) => {
  throw new Error(message, { cause: { status, extra } });
}

// error-templates
export const badRequestExpeption = ({ message = "badRequestExpeption", extra = {} } = {}) => {
  return ErrorResponse({ message, status: 400, extra });
}

export const NotFoundExpeption = ({ message = "NotFoundExpeption", extra = {} } = {}) => {
  return ErrorResponse({ message, status: 404, extra });
}

export const unauthorizedExpeption = ({ message = "unauthorizedExpeption", extra = {} } = {}) => {
  return ErrorResponse({ message, status: 401, extra });
}

export const conflictExpeption = ({ message = "conflictExpeption", extra = {} } = {}) => {
  return ErrorResponse({ message, status: 409, extra });
}

export const forbiddenExpeption = ({ message = "forbiddenExpeption", extra = {} } = {}) => {
  return ErrorResponse({ message, status: 403, extra });
}