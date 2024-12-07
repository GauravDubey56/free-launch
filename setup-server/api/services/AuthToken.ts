import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../interfaces/AuthInterface.js";
import CustomError from "../utils/error";
import ServiceResponse from "./Response";
class AuthToken {
  #jwtToken: string;
  constructor() {
    this.#jwtToken = String(process.env.JWT_SECRET);;
  }
  createToken(tokenData: clientTokenData, expiryInSeconds?: number) {
    const secret = this.#jwtToken;
    const jwtToken = jwt.sign(tokenData, secret);
    return jwtToken;
  }
  decryptTokenFromHeaders(req: AuthenticatedRequest) {
    const response = new ServiceResponse(400);
    try {
      let token = req.header("Authorization");
      if (!token) {
        throw new CustomError("Unauthorized access: No token provided", 401);
      }
      const secret = this.#jwtToken;
      const tokenData = jwt.verify(token, secret) as clientTokenData
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