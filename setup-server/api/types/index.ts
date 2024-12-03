type EnvVar = string | undefined;

type apiResponse = {
  data?: any;
  error?: Error;
  redirectUrl?: string;
  statusCode: number;
  message?: string;
};

type serviceResponse = {
  status: number;
  data?: any;
  message: string;
  error?: typeof Error | string | object;
};
type serviceError = string | typeof Error | object | null;
type clientInfo = {
  githubUsername?: string;
};

type clientTokenData = {
  email: string;
  clientId: number;
  name: string;
  githubUsername: string | undefined;
};