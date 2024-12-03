import { NextFunction, Response, Request, ErrorRequestHandler } from "express";
import CustomError from "./error";
import sendResponse from "./response";
import AuthToken from "../services/AuthToken";
import { AuthenticatedRequest } from "../interfaces/AuthInterface";
const handleApiException = (error: any) => {
  if (error instanceof CustomError) {
    let errorObject: any = {};
    try {
      errorObject = JSON.parse(error.message);
    } catch (err) {
      errorObject.errMessage = error.message;
      errorObject.code = 400;
    }
    return {
      statusCode: errorObject.code,
      message: errorObject.errMessage,
    };
  } else {
    return {
      statusCode: 500,
      error,
    };
  }
};

export const asyncHandler =
  (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error(error);
      const errorObject = handleApiException(error);
      sendResponse(res, errorObject);
    }
  };

export const nextErrorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);
  if (error) {
    sendResponse(res, {
      statusCode: 500,
      message: "Something went wrong",
      error,
    });
  } else {
    sendResponse(res, {
      statusCode: 500,
      message: "An unkown error occurred",
    });
  }
};

export const authHandler = (req: any, res: Response, next: NextFunction) => {
  const auth = new AuthToken();
  const authResponse = auth.decryptTokenFromHeaders(req as AuthenticatedRequest);
  if(authResponse.error) {
    throw new CustomError('Unauthorized access', 401);
  } else {
    req.user = authResponse.data
    next();
  }
};
