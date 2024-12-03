import { config } from "dotenv";
config();
export const GITHUB_CLIENT_ID: EnvVar = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET: EnvVar = process.env.GITHUB_CLIENT_SECRET;
export const SERVER_HOST_URL: EnvVar = process.env.SERVER_HOST_URL;
export const GITHUB_CALLBACK_URL: string = `${process.env.SERVER_HOST_URL}/auth/githubCallback`;
export const GITHUB_AUTH_URL: string = `https://github.com/login/oauth/authorize`;
export const GITHUB_API_URL: string = `https://api.github.com`;
export const GITHUB_USER_API: string = `https://api.github.com/user`;
export const DB_CONNECT_URL: string =
  process.env.DB_CONNECT_URL || process.env.AUTH_DB_LOCAL_CONNECT || "";
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_PORT = Number(process.env.DB_PORT) || 26257;
export const DB_HOST = process.env.DB_HOST;
export const DB_NAME = process.env.DB_NAME;
export const AUTH_PAGE_URL: string = process.env.AUTH_PAGE_URL || "";
export const GITHUB_REDIRECT_TO: string = process.env.GITHUB_REDIRECT_TO || "";