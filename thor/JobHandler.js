const ExpressAppHandler = require("./ExpressHandler");
const axios = require("axios");
const JOB_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
};
const notifyDeploymentStatus = async (deploymentId, status, message) => {
  try {
    console.log("Notifying deployment status");
    console.log("Deployment ID: ", deploymentId);
    console.log("Status: ", status);
    const serverUrl = process.env.AUTH_SERVICE_URL;
    if (!serverUrl) {
      console.error("API URL is missing");
      return;
    }
    const payload = {
      accessKey: process.env.SERVICE_ACCESS_KEY,
      deploymentId,
      status,
      message: message || "",
    };
    const apiUrl = `${serverUrl}/githubApp/notifyDeploymentStatus`;
    const response = await axios.post(apiUrl, payload);
    console.log("Deployment status notified");
    console.log("Response: ", response.data);
  } catch (error) {
    console.error("Error occurred while notifying deployment status: ", error?.response?.data || error);
  }
};
const jobHandler = async (deplomentInput) => {
  try {
    switch (deplomentInput.repoType) {
      case "express": {
        const expressHandler = new ExpressAppHandler(
          deplomentInput.deploymentId,
          deplomentInput.lambdaFunctionName,
          deplomentInput.repoZipUrl
        );
        expressHandler.createTempDirForRepo();
        await expressHandler.downloadRepo().then(() => {
          expressHandler.extractZip();
          expressHandler.prepareLambda();
          notifyDeploymentStatus(
            deplomentInput.deploymentId,
            JOB_STATUS.COMPLETED,
            "Deployment job completed"
          );
        }).catch((error) => {
            console.error("Error occurred while downloading repo", error);
            notifyDeploymentStatus(
                deplomentInput.deploymentId,
                JOB_STATUS.FAILED,
                "Error occurred while downloading repo"
            );
            });
        expressHandler.unlinkTempDir();
        expressHandler.unlinkRepo();
        break;
      }
      default: {
        console.error("Invalid repo type");
        await notifyDeploymentStatus(
          deplomentInput.deploymentId,
          JOB_STATUS.FAILED,
          "Invalid repo type"
        );
        return;
      }
    }
  } catch (error) {
    console.error("Error occurred while processing deployment job", error);
    await notifyDeploymentStatus(
      deplomentInput.deploymentId,
      JOB_STATUS.FAILED,
      "Internal server error"
    );
  }
};

module.exports.jobHandler = jobHandler;
