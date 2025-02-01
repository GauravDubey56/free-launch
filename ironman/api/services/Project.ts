import { Project } from "../database/entity/Project";
import Db, { initializeDb } from "../database/datasource";
import CustomError from "../utils/error";
import { CreateNewApp, UpdateApp } from "../interfaces/ProjectInterface";
import ServiceResponse from "./Response";
import Crypto from "crypto";
import * as constants from "../config/constants";
import queryString from "querystring";
import { ProjectRepository } from "../database/entity/ProjectRepository";
import { User } from "../database/entity/User";
class ProjectService {
  #ownerId: number;
  constructor(ownerId: number) {
    this.#ownerId = ownerId;
  }
  generateRandomAppId(length = 10) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters.charAt(randomIndex);
    }
    return result;
  }
  getAppByName(appName: string) {
    return Db.getRepository(Project)
      .createQueryBuilder("project")
      .where("project.name = :appName ", {
        appName,
      })
      .andWhere("project.clientId = :ownerId", {
        ownerId: this.#ownerId,
      })
      .getOne();
  }
  generateAccessKeyAndHash() {
    const secretKey = Crypto.randomBytes(20).toString("hex");
    const salt = Crypto.randomBytes(16).toString("hex");
    const hashedPassword = Crypto.pbkdf2Sync(
      secretKey,
      salt,
      10,
      32,
      "sha512"
    ).toString("hex");
    return {
      secretKey,
      hashedKey: [salt, hashedPassword].join("#"),
      hash: hashedPassword,
      salt,
    };
  }
  generateHashFromAccessKey(secretKey: string) {
    const salt = Crypto.randomBytes(16).toString("hex");
    const hashedPassword = Crypto.pbkdf2Sync(
      secretKey,
      salt,
      10,
      32,
      "sha512"
    ).toString("hex");
    return {
      secretKey,
      hashedKey: [salt, hashedPassword].join("#"),
    };
  }
  async getAppById(id: number) {
    await initializeDb(Db);
    const data = await Db.getRepository(Project)
      .createQueryBuilder("project")
      .select("project.name", "AppName")
      .addSelect("project.id", "AppId")
      .addSelect("project.callback_url", "CallbackUrl")
      .addSelect("project.app_id", "AppAccessId")
      .where(`project.id = ${id}`)
      .andWhere("project.clientId = :ownerId", {
        ownerId: this.#ownerId,
      })
      .execute();
    if (data) {
      return data;
    } else {
      throw new CustomError("No data found for given id", 400);
    }
  }
  async createApp({ callbackUrl, appName }: CreateNewApp) {
    await initializeDb(Db);
    const response = new ServiceResponse(400);
    const existingApp = await this.getAppByName(appName);
    if (existingApp) {
      throw new CustomError("Application with given name already exists");
    } else {
      const project = new Project();
      project.name = appName;
      project.appId = this.generateRandomAppId();
      project.userId = this.#ownerId;
      const secrets = this.generateAccessKeyAndHash();
      project.hash = secrets.hash;
      project.salt = secrets.salt;
      project.accessKey = secrets.secretKey;
      project.appInfo = {};
      await Db.getRepository(Project).save(project);
      const authUrl = `${constants.AUTH_PAGE_URL}?${queryString.stringify({
        appId: project.appId,
        accessId: secrets.secretKey,
      })}`;
      return response
        .success("New application created", {
          secretKey: secrets.secretKey,
          authUrl,
        })
        .getResponse();
    }
  }
  async getApps(id?: number) {
    await initializeDb(Db);
    let data = Db.getRepository(Project)
      .createQueryBuilder("project")
      .select("project.name", "AppName")
      .addSelect("project.id", "AppId")
      .addSelect("project.callback_url", "CallbackUrl")
      .addSelect("project.app_id", "AppAccessId")
      .where("project.clientId = :ownerId", {
        ownerId: this.#ownerId,
      });
    if (id) {
      data = data.andWhere("project.id = :appId", {
        appId: id,
      });
    }
    data = await data.execute();
    const response = new ServiceResponse(200);
    return response
      .setData(data)
      .setMessage(`${data ? "Apps fetched" : "No app found"} `)
      .getResponse();
  }
  async updateApp(appId: number, updateData: UpdateApp) {
    await initializeDb(Db);
    const response = new ServiceResponse(200);
    await this.getAppById(appId);
    let project: any = {};
    if (updateData.appName) {
      project.name = updateData.appName;
    }
    await Db.getRepository(Project).update(
      {
        id: appId,
      },
      project
    );
    return response.setMessage("App updated").getResponse();
  }
  async getRepositories(repoId?: string) {
    await initializeDb(Db);
    const response = new ServiceResponse(200);
    const data = await Db.getRepository(ProjectRepository)
      .createQueryBuilder("repo")
      .select("repo.repository_name", "RepoName")
      .addSelect("repo.repository_id", "RepositoryId")
      .addSelect("repo.default_branch", "DefaultBranch")
      .where(
        `repo.userId = :userId ${
          repoId ? "and repo.repository_id = :repositoryId" : ""
        }`,
        {
          userId: this.#ownerId,
          ...(repoId && { repositoryId: repoId }),
        }
      )
      .execute();
    return response
      .setData(data)
      .setMessage("Repositories fetched")
      .getResponse();
  }
  async getRepositoryById(repoId?: string) {
    await initializeDb(Db);
    let query = Db.getRepository(ProjectRepository)
      .createQueryBuilder("repo")
      .select("repo.repository_name", "repositoryName")
      .addSelect("repo.id", "id")
      .innerJoinAndSelect(User, "repoUser", "repoUser.id = repo.userId")
      .where(
        `repo.userId = :userId ${
          repoId ? "and repo.repository_id = :repositoryId" : ""
        }`,
        {
          userId: this.#ownerId,
          ...(repoId && { repositoryId: repoId.toString() }),
        }
      )
    console.log(query.getSql(), this.#ownerId,repoId, );
    const data = await query.execute();
    console.log(query.getSql(), this.#ownerId,repoId,data );
    return data[0];
  }
  async updateRepo(appId: number, updateData: any) {
    await initializeDb(Db);
    const response = new ServiceResponse(200);
    await Db.getRepository(ProjectRepository).update(
      {
        id: appId,
      },
      updateData
    );
    return response.setMessage("App updated").getResponse();
  }
}

export default ProjectService;
