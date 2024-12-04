import axios from "axios";
import Db, { initializeDb } from "../database/datasource";
import {
  DeploymentInfo,
  DeploymentJobStatus,
} from "../database/entity/DeploymentInfo";
import { ProjectRepository } from "../database/entity/ProjectRepository";
import { RepoTypes } from "../interfaces/ProjectInterface";
import CustomError from "../utils/error";
import { DEPLOYER_SERVICE_URL } from "../config/constants";

class DeploymentJobService {
  deploymentInfo: DeploymentInfo;
  projectRepository: ProjectRepository;
  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }
  async createDeploymentJob() {
    const projectRepository = this.projectRepository;
    const deploymentJob = new DeploymentInfo();
    deploymentJob.projectRepositoryId = projectRepository.id
    deploymentJob.initiatedAt = new Date();
    deploymentJob.deploymentStatus = "pending";
    await initializeDb(Db);
    await Db.getRepository(DeploymentInfo).save(deploymentJob);
    this.deploymentInfo = deploymentJob;
  }

  async sendDeploymentJobToQueue() {
    try {
      const projectRepository = this.projectRepository;
      const deploymentJob = this.deploymentInfo;
      if (!deploymentJob) {
        throw new CustomError("Deployment job not found", 404);
      }
      if (deploymentJob.deploymentStatus == "in_progress") {
        throw new CustomError("Deployment job already in progress", 400);
      }
      if (!projectRepository.contentUrl) {
        throw new CustomError("Repository content url not found", 400);
      }
      const servicePayload = {
        deploymentId: deploymentJob.id,
        lambdaFunctionName: projectRepository.repositoryName,
        repoZipUrl: projectRepository.contentUrl,
        repoType: RepoTypes.express,
      };
      const apiUrl = `${DEPLOYER_SERVICE_URL}/deploymentJob`
      const response = await axios.post(apiUrl, servicePayload);
      return {
        status: response.status,
        data: response.data,
      }
    } catch (err) {
        const error = err as any;
        console.log(`Deployment job init failed`, error.response || error);
        await this.updateDeploymentJobStatus("failed");
        throw new CustomError(error.message, error.response?.status || 500);
    }
  }
  async setDeploymentJob(deploymentId: number) {
    await initializeDb(Db);
    const activeJob = await Db.getRepository(DeploymentInfo).findOne({
      where: {
        id: deploymentId,
      },
    });
    if (!activeJob) {
      throw new CustomError("Deployment job not found", 404);
    }
    this.deploymentInfo = activeJob;
  }
  async updateDeploymentJobStatus(status: DeploymentJobStatus) {
    if (!this.deploymentInfo) {
      throw new CustomError("Deployment job not found", 404);
    }
    const previousStatus = this.deploymentInfo.deploymentStatus;
    this.deploymentInfo.deploymentStatus = status;
    if (previousStatus === "pending" && status === "in_progress") {
      this.deploymentInfo.initiatedAt = new Date();
    } else if (previousStatus === "in_progress" && status === "completed") {
      this.deploymentInfo.completedAt = new Date();
    }
    await Db.getRepository(DeploymentInfo).save(this.deploymentInfo);
  }
  static async getDeploymentJobs(projectRepoId: number) {
    await initializeDb(Db);
    return Db.getRepository(DeploymentInfo).find({
      where: {
        projectRepositoryId: projectRepoId,
      }
    });
  }
  static async getDeploymentJobById(deploymentId: number) {
    await initializeDb(Db);
    return Db.getRepository(DeploymentInfo).findOne({
      where: {
        id: deploymentId,
      },
    });
  }
  static async updateDeploymentJobStatus(deploymentId: number, status: DeploymentJobStatus) {
    await initializeDb(Db);
    const deploymentJob = await Db.getRepository(DeploymentInfo).findOne({
      where: {
        id: deploymentId,
      },
    });
    if (!deploymentJob) {
      throw new CustomError("Deployment job not found", 404);
    }
    deploymentJob.deploymentStatus = status;
    if (status === "completed") {
      deploymentJob.completedAt = new Date();
    }
    await Db.getRepository(DeploymentInfo).save(deploymentJob);
  }
}

export default DeploymentJobService;
