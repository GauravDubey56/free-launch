export interface CreateNewApp {
  callbackUrl: string;
  appName: string;
}

export interface UpdateApp {
  callbackUrl?: string;
  appName?: string;
}
export enum GithubAppEvents {
  created = "created",
  deleted = "deleted",
  suspended = "suspended",
  added = "added"
}

export enum RepoTypes {
  express = "express"
}