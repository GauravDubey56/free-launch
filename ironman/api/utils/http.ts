import axios, { AxiosRequestConfig } from "axios";
import Logger from "./logging";
const ApiLogger = new Logger("apiCalls.log");
class Http {
  static handleException = (error: any) => {
    // ApiLogger.log(error)
    console.debug(error);
    if (error?.response && typeof error.response == "object") {
      return {
        ...error.response,
        apiSuccess: false,
      };
    } else {
      return {
        status: 500,
        apiSuccess: false,
      };
    }
  };
  static async get(url: string, { headers = {}, query }: any) {
    try {
      const response: any = await axios.get(url, { headers, params: query });
      response.apiSuccess = true;
      return response;
    } catch (error) {
      return this.handleException(error);
    }
  }

  static async post(url: string, { data = {}, headers = {} }: any) {
    try {
      const response: any = await axios.post(url, data, { headers });
      response.apiSuccess = true;
      return response;
    } catch (error) {
      return this.handleException(error);
    }
  }

  static async put(url: string, { data = {}, headers = {} }: any) {
    try {
      const response: any = await axios.put(url, data, { headers });
      response.apiSuccess = true;
      return response;
    } catch (error) {
      return this.handleException(error);
    }
  }

  static async delete(url: string, headers = {}) {
    try {
      const response: any = await axios.delete(url, { headers });
      response.apiSuccess = true;
      return response;
    } catch (error) {
      return this.handleException(error);
    }
  }

  static async pauseRedirection(url: string, { headers = {}, query }: any) {
    const axiosInstance = axios.create();
    axiosInstance.defaults.maxRedirects = 0;
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && [301, 302].includes(error.response.status)) {
          const redirectUrl = error.response.headers.location;
          return {
            data: redirectUrl,
            response: error.response,
          };
        }
        return Promise.reject(error);
      }
    );
    const response = await axiosInstance.request({
      url,
      headers
    });
    return response
  }
}

export default Http;
