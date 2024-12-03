// import * as queryString from 'query-string';
import * as Constants from "../config/constants";
import Http from "../utils/http";
import Db from "../database/datasource";
import queryString from "querystring";
import CustomError from "../utils/error";
import Logger from "../utils/logging";
import { User } from "../database/entity/User";
import { ProjectRepository } from "../database/entity/ProjectRepository";
import DatabaseConnection from "../database/connection";
import UserService from "./ClientService";
import { In, Not } from "typeorm";
class GithubAuthService {
  #accessCode: any;
  #authToken: any;
  #refreshToken: any;
  constructor(code?: any, accessToken?: any) {
    if (code) {
      this.setAccessCode(code);
    }
    if (accessToken) {
      this.setAuthToken(accessToken);
    }
  }
  static async generateAuthUrl(): Promise<string> {
    const params = queryString.stringify({
      client_id: Constants.GITHUB_CLIENT_ID,
      client_secret: Constants.GITHUB_CLIENT_SECRET,
      // redirect_uri: Constants.GITHUB_CALLBACK_URL,
      scope: `user:email,repo`,
    });
    const githubLoginUrl = `${Constants.GITHUB_AUTH_URL}?${params}`;
    return githubLoginUrl;
  }
  setAccessCode(code: string) {
    this.#accessCode = code;
  }
  getAccessCode() {
    return this.#accessCode;
  }
  setAuthToken(token: any) {
    this.#authToken = token;
  }
  getAuthToken() {
    return this.#authToken;
  }
  setRefreshToken(refreshToken: string) {
    this.#refreshToken = refreshToken;
    return this;
  }
  getRefreshToken() {
    return this.#refreshToken;
  }
  async getUserAccessToken(code?: any, queryParams?: any) {
    if (this.getAuthToken()) {
      return this.getAuthToken();
    }
    if (!code) {
      code = this.getAccessCode();
    }
    const params = queryString.stringify({
      client_id: Constants.GITHUB_CLIENT_ID,
      client_secret: Constants.GITHUB_CLIENT_SECRET,
      code,
      ...(queryParams && { queryParams }),
    });
    const apiCall = {
      url: `https://github.com/login/oauth/access_token?${params}`,
      headers: {
        accept: "application/json",
      },
    };
    const response = await Http.post(apiCall.url, { headers: apiCall.headers });
    if (response?.data?.access_token) {
      this.setAuthToken(response?.data?.access_token);
      this.setRefreshToken(response?.data?.refresh_token);
      return response?.data?.access_token;
    } else {
      throw new CustomError(`Could not generate access token for code ${code}`);
    }
  }
  private async getHeaderForUserApi() {
    const accessToken = await this.getUserAccessToken();
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }
  async getUserFromAuthCode() {
    const apiCall = {
      url: `${Constants.GITHUB_USER_API}`,
      headers: await this.getHeaderForUserApi(),
    };
    const response = await Http.get(apiCall.url, { headers: apiCall.headers });
    return response.data;
  }
  async getEmailsByUser() {
    const authHeader = await this.getHeaderForUserApi();
    const apiCall = {
      url: `${Constants.GITHUB_USER_API}/emails`,
      headers: authHeader,
    };
    const response = await Http.get(apiCall.url, { headers: apiCall.headers });
    if (Array.isArray(response.data)) {
      Logger.log(`user received`);
      return response.data.filter((emailId: any) => emailId.primary)[0].email;
    } else {
      throw new CustomError("Could not find email for github user");
    }
  }
  async createUserFromWebhook(body: any) {
    if (body?.repositories?.length) {
      const connection = await DatabaseConnection.getInstance();
      const queryRunner = Db.createQueryRunner();
      let user =
        (await queryRunner.manager.getRepository(User).findOne({
          where: {
            githubId: body?.sender?.id,
          },
        })) || new User();
      user.firstName = body?.sender?.login;
      user.githubId = body?.sender?.id;
      user.clientInfo = {
        githubUsername: body.sender.login
      }
      console.log('webhook',user);
      const existingRepositories = user.id
        ? await Db.getRepository(ProjectRepository).find({
            where: {
              userId: user.id,
              repositoryId: In(
                body.repositories.map((repo: any) => repo.id as string)
              ),
            },
            select: ["repositoryId"],
          })
        : [];
      const existingRepoIds = existingRepositories.map(
        (repo) => repo.repositoryId
      );
      const repositories = body.repositories.map((repo: any) => {
        let userRepo = existingRepoIds.includes(repo.id)
          ? (existingRepositories.find(
              (existingRepo) => existingRepo.repositoryId == repo.id
            ) as ProjectRepository)
          : new ProjectRepository();
        if (!userRepo) {
          userRepo = new ProjectRepository();
        }
        userRepo.repositoryId = repo.id;
        userRepo.repositoryName = repo.name;
        userRepo.user = user;
        return userRepo;
      });
      user.projectRepository = repositories;
      await connection.transaction(async (transactionManager) => {
        await transactionManager.save(User, user);
        if (repositories.length) {
          await transactionManager.save(ProjectRepository, repositories);
        }
      });
      return {
        success: true,
      };
    } else {
      Logger.log(`No repo selected for installation`, body);
      return {
        success: false,
      };
    }
  }
  async getRepositoryDetails(githubUsername: string, repoName: string) {
    try {
      const authHeader = await this.getHeaderForUserApi();
      const apiCall = {
        url: `${Constants.GITHUB_API_URL}/repos/${githubUsername}/${repoName}`,
        headers: authHeader,
      };
      console.log(apiCall)
      const response = await Http.get(apiCall.url, {
        headers: apiCall.headers,
      });
      if (response.status == 200 && response?.data?.id) {
        return response.data;
      } else {
        Logger.log(response);
      }
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
  async getRepositoryZipUrl({
    githubUsername,
    repoName,
    branch,
  }: {
    githubUsername: string;
    repoName: string;
    branch: string;
  }) {
    try {
      const authHeader = await this.getHeaderForUserApi();
      const apiCall = {
        url: `${Constants.GITHUB_API_URL}/repos/${githubUsername}/${repoName}/zipball/${branch}`,
        headers: authHeader,
      };
      const response = await Http.pauseRedirection(apiCall.url, {
        headers: apiCall.headers,
      });
      if (response?.data) {
        return {
          zipUrl: response?.data,
        };
      } else {
        return null;
      }
    } catch (error: any) {
      Logger.error(error?.response);
      throw error;
    }
  }

  async addRepositoryToInstallation(body: any) {
    try {
      const reposAdded = body.repositories_added as any[];
      const repoIdsAddedSet = new Set(reposAdded.map((repo) => repo.id));
      if (!reposAdded?.length) {
        return {
          success: false,
        };
      }
      const connection = await DatabaseConnection.getInstance();
      const queryRunner = Db.createQueryRunner();
      let user =
      (await queryRunner.manager.getRepository(User).findOne({
        where: {
          githubId: body?.sender?.id,
        },
      })) || new User();
    user.firstName = body?.sender?.login;
    user.githubId = body?.sender?.id;
    user.clientInfo = {
      githubUsername: body.sender.login
    }
    console.log('webhook',user);
    const existingRepositories = user.id
      ? await Db.getRepository(ProjectRepository).find({
          where: {
            userId: user.id
          },
          select: ["repositoryId"],
        })
      : [];
    const existingRepoIds = existingRepositories.map(
      (repo) => repo.repositoryId
    );
    const existingReposNotAdded = existingRepositories.filter(
      (repo) => !repoIdsAddedSet.has(repo.repositoryId)
    );
    const repositories = reposAdded.map((repo: any) => {
      let userRepo = existingRepoIds.includes(repo.id)
        ? (existingRepositories.find(
            (existingRepo) => existingRepo.repositoryId == repo.id
          ) as ProjectRepository)
        : new ProjectRepository();
      if (!userRepo) {
        userRepo = new ProjectRepository();
      }
      userRepo.repositoryId = repo.id;
      userRepo.repositoryName = repo.name;
      userRepo.user = user;
      return userRepo;
    });
    await connection.transaction(async (transactionManager) => {
      await transactionManager.save(User, user);
      if (repositories.length) {
        await transactionManager.save(ProjectRepository, repositories);
      }
    });
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}

export default GithubAuthService;
