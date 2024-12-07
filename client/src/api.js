import axios from "axios";

const API_BASE = "http://localhost:8000"; // Replace with your backend
// const API_BASE = 'http://localhost:8000'; // Replace with your backend

export const LOCAL_STORE_KEYS = {
  APP_TOKEN: "accessToken",
};
export const getLocalStoreItem = (key) => {
  return localStorage.getItem(key);
};

export const setLocalStoreItem = (key, value) => {
  localStorage.setItem(key, value);
};
export const getAppToken = () => {
  return getLocalStoreItem(LOCAL_STORE_KEYS.APP_TOKEN);
};
export const authHeader = () => {
  return {
    Authorization: getAppToken(),
  };
};

export const fetchRepositories = async () => {
    console.log(authHeader());
  const response = await axios.request({
    method: "GET",
    url: `${API_BASE}/githubApp/getRepositories`,
    headers: authHeader(),
  });
  if (response?.data?.data?.length) {
    return {
      data: response.data.data,
      success: true,
    };
  } else {
    return {
      success: true,
      message: response.data.message,
    };
  }
};

export const fetchDeploymentJobs = async (repoId) => {
  const response = await axios.get(`${API_BASE}/githubApp/deploymentJobs`, {
    query: {
      RepositoryId: repoId,
    },
  });
  if (response?.data?.data?.length) {
    return {
      data: response.data.data,
      success: true,
    };
  } else {
    return {
      success: true,
      message: response.data.message,
    };
  }
};

export const triggerDeploy = async (repoId) => {
  const response = await axios.post(`${API_BASE}/githubApp/deploymentJob`, {
    RepositoryId: repoId,
  });
  if (response.status === 200) {
    return {
      success: true,
      message: "Deployment triggered successfully",
    };
  } else {
    return {
      success: false,
      message: "Failed to trigger deployment",
    };
  }
};

export const fetchAuthToken = async (githubRedirectCode) => {
  const response = await axios.get(
    `${API_BASE}/auth/githubCallback?code=${githubRedirectCode}`
  );
  const token = response.data.data?.successToken;
  if (token) {
    localStorage.setItem(LOCAL_STORE_KEYS.APP_TOKEN, token);
    return {
      success: true,
    };
  } else {
    return {
      success: false,
    };
  }
};
