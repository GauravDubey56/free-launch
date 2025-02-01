import GithubAuthService from "../services/GithubAuthService";
import { Request, Response } from "express";
import * as Log from "../utils/logger";
import sendResponse from "../utils/response";
import UserService from "../services/ClientService";
import ClientService from "../services/ClientService";
import { GITHUB_REDIRECT_TO } from "../config/constants";
import queryString from "querystring";
import Logger from "../utils/logging";

export const generateAuthUrl = async (req: Request, res: Response) => {
  const authUrl = await GithubAuthService.generateAuthUrl();
  Log.debug(`Auth url`, authUrl);
  if (process.env.REDIRECT_GITHUB) {
    res.redirect(authUrl);
  } else {
    sendResponse(res, {
      statusCode: 200,
      data: {
        authUrl,
      },
    });
  }
};

export const handleGithubCallback = async (req: Request, res: Response) => {
  if (req?.query?.code) {
    const GithubUserService = new GithubAuthService(req.query.code);
    const githubUserData = await GithubUserService.getUserFromAuthCode();
    const githubEmail = await GithubUserService.getEmailsByUser();
    const newUser = await ClientService.createUserFromGithub({
      githubUserData,
      githubEmail,
      tokens: {
        githubAccessToken: GithubUserService.getAuthToken(),
        githubRefreshToken: GithubUserService.getRefreshToken(),
      }  
    });
    Logger.log(`User exists token`, newUser);
    if (newUser?.data?.token) {
      // const queryParam = queryString.stringify({
      //   successToken: newUser.data.token,
      // });
      sendResponse(res, {
        // redirectUrl: `${GITHUB_REDIRECT_TO}?${queryParam}`,
        statusCode: 200,
        data: {
          successToken: newUser.data.token,
        }
      });
    }
  } else {
    const error = queryString.stringify({
      error: `Something went wrong`,
    });
    sendResponse(res, {
      statusCode: 200,
      // redirectUrl: `${GITHUB_REDIRECT_TO}?${error}`,
    });
  }
};
