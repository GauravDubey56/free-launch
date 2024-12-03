import Db from "../database/datasource";
import { User } from "../database/entity/User";
import Logger from "../utils/logging";
import ServiceResponse from "./Response";
import { randomUUID } from "crypto";
import { DefaultAuthHandler } from "./AuthToken";

class UserService {
  static splitName(name: string) {
    const parts = name.split(/\s/g);
    return {
      firstName: parts[0],
      ...(parts.length > 1 && { lastName: parts.slice(2).join(" ") }),
    };
  }
  static async createUserFromGithub({
    githubUserData,
    githubEmail,
    tokens,
  }: any) {
    const queryRunner = Db.createQueryRunner();
    const response = new ServiceResponse(400);
    try {
      await queryRunner.connect();
      const githubId = githubUserData.id;
      await queryRunner.startTransaction();

      let client =
        (await queryRunner.manager.findOne(User, {
          where: {
            githubId,
          },
        })) || new User();
      if (tokens?.githubAccessToken) {
        client.githubAccessToken = tokens?.githubAccessToken;
      }
      if (tokens?.githubRefreshToken) {
        client.githubRefreshToken = tokens?.githubRefreshToken;
      }
      if (client) {
        Logger.log(`user already exists`);
        client.email = githubEmail;
        const { firstName, lastName } = this.splitName(githubUserData.name);
        client.firstName = firstName;
        if (lastName) {
          client.lastName = lastName;
        }
        if (tokens?.githubAccessToken) {
          client.githubAccessToken = tokens?.githubAccessToken;
        }
        if (tokens?.githubRefreshToken) {
          client.githubRefreshToken = tokens?.githubRefreshToken;
        }
        client.ownerId = randomUUID();
        await queryRunner.manager.save(client);
        const jwtToken = DefaultAuthHandler.createToken(client.getClient());
        response.success("Github user already exists", {
          token: jwtToken,
          userExists: true,
        });
        return response.getResponse();
      }

      client = new User();
      client.email = githubEmail;
      client.githubId = githubId;
      client.clientInfo = {
        githubUsername: githubUserData.login,
      };
      const { firstName, lastName } = this.splitName(githubUserData.name);
      client.firstName = firstName;
      if (lastName) {
        client.lastName = lastName;
      }
      client.ownerId = randomUUID();
      await queryRunner.manager.save(client);
      const clientData = client.getClient();
      const jwtToken = DefaultAuthHandler.createToken(clientData);
      response.success("New user created", {
        token: jwtToken,
      });
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      Logger.error(error);
      error = new Error(error?.message || error);
      response.setError(error);
    } finally {
      if (queryRunner.isTransactionActive) {
        if (response.status == 200) {
          await queryRunner.commitTransaction();
        } else {
          await queryRunner.rollbackTransaction();
        }
      }
      return response.getResponse();
    }
  }
}

export default UserService;
