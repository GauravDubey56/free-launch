import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces/AuthInterface";
import ProjectService from "../services/Project";
import sendResponse from "../utils/response";
import { GithubAppEvents } from "../interfaces/ProjectInterface";
import GithubAuthService from "../services/GithubAuthService";
import Http from "../utils/http";
import CustomError from "../utils/error";
import Logger from "../utils/logging";
import { uploadGithubRepo } from "../utils/upload";
enum ActionTypes {
  fetchAndStoreZip = "fetchAndStoreZip",
}
interface EventInterface {
  action: ActionTypes;
  params: {
    accessToken: string;
    refreshToken: string;
    ownerUsername: string;
    repoName: string;
  };
}

export const createNewApp = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const clientApp = new ProjectService(req.user.clientId);
  const newApp = await clientApp.createApp({
    callbackUrl: req.body.CallbackUrl,
    appName: req.body.AppName,
  });
  sendResponse(res, {
    statusCode: newApp.status,
    message: newApp.message,
    data: newApp.data,
  });
};

export const getClientApps = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const clientApp = new ProjectService(req.user.clientId);
  const appsData = await clientApp.getApps(Number(req.query.appId));
  sendResponse(res, {
    statusCode: appsData.status,
    message: appsData.message,
    data: appsData.data,
  });
};
export const updateApp = async (req: AuthenticatedRequest, res: Response) => {
  const clientApp = new ProjectService(req.user.clientId);
  const updateApp = await clientApp.updateApp(
    Number(req.query.appId),
    req.body
  );
  sendResponse(res, {
    statusCode: updateApp.status,
    message: updateApp.message,
    data: updateApp.data,
  });
};

export const webhookHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  let response: any = {};
  console.log('webhookHandler', req.body)
  switch (String(req.body.action)) {
    case GithubAppEvents.created: {
      const githubService = new GithubAuthService();
      response = githubService.createUserFromWebhook(req.body);
    }
    case GithubAppEvents.added: {
      const githubService = new GithubAuthService();
      response = await githubService.addRepositoryToInstallation(req.body);
    }
    default: {
      response = {
        sucess: true,
      };
    }
  }
  sendResponse(res, {
    statusCode: 200,
    message: response.success ? "Action handled" : "Action failed to record",
  });
};

export const getRepositoriesByUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const repoService = new ProjectService(req.user.clientId);
  const response = await repoService.getRepositories();
  sendResponse(res, {
    statusCode: 200,
    data: response.data,
    message: response.message,
  });
};

export const generateDocRepository = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const repoService = new ProjectService(req.user.clientId);
  let repository = await repoService.getRepositoryById(req.body.RepositoryId);
  if (!repository) {
    throw new CustomError("No such repository found", 400);
  } else {
    const github = new GithubAuthService(
      null,
      repository.repoUser_github_access_token
    );
    const repoData = await github.getRepositoryDetails(
      repository.repoUser_client_info.githubUsername as string,
      repository.repositoryName
    );
    const repo = new ProjectService(req.user.clientId);
    if (repoData) {
      const repoZip = await github.getRepositoryZipUrl({
        githubUsername: repository.repoUser_client_info.githubUsername as string,
        repoName: repository.repositoryName,
        branch: repoData.default_branch,
      });
      const s3Upload = await uploadGithubRepo({
        repoZipUrl: repoZip?.zipUrl,
        repoName: repository.repositoryName,
        userId: req.user.clientId,
      });
      await repo.updateRepo(repository.id, {
        defaultBranch: repoData.default_branch,
        contentUrl: s3Upload.uploadUrl,
      });
      sendResponse(res, {
        statusCode: 200,
        data: {
          fetchUrl: s3Upload.signedUrl,
        },
      });
    } else {
      throw new CustomError("No such repository found", 400);
    }
  }
};
