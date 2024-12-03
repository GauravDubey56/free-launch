import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../interfaces/AuthInterface.js";
import CustomError from "../utils/error";
import ServiceResponse from "./Response";
class AuthToken {
  #jwtToken: string;
  constructor(secret?: string) {
    if (!secret) {
      secret = String(process.env.JWT_SECRET);
    }
    this.#jwtToken = secret;
  }
  createToken(tokenData: clientTokenData, expiryInSeconds?: number) {
    const jwtToken = jwt.sign(tokenData, this.#jwtToken);
    return jwtToken;
  }
  decryptTokenFromHeaders(req: AuthenticatedRequest) {
    const response = new ServiceResponse(400);
    try {
      let token = req.header("Authorization");
      if (!token) {
        throw new CustomError("Unauthorized access: No token provided", 401);
      }
      const tokenData = jwt.verify(token, this.#jwtToken) as clientTokenData
      req.user = tokenData;
      response.success("User authenticated", tokenData);
    } catch (error) {
      response.setError("Unauthorized request");
    } finally {
      return response.getResponse();
    }
  }
}

export default AuthToken;
const DefaultAuthHandler = new AuthToken();
export {
  DefaultAuthHandler
}