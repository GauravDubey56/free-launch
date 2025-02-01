const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const { jobHandler } = require("./JobHandler");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.post("/deploymentJob", async (req, res) => {
  try {
    console.log("Received deployment job");

    const deplomentInput = {
      deploymentId: req.body.deploymentId,
      lambdaFunctionName: req.body.lambdaFunctionName,
      repoZipUrl: req.body.repoZipUrl,
      repoType: req.body.repoType,
    };
    const invalidRequest = Object.values(deplomentInput).some(
      (value) => !value
    );
    if (invalidRequest) {
      return res.status(400).send({
        success: false,
        message: "Invalid request",
      });
    }

    res.status(200).send({
      success: true,
      message: "Deployment job received",
    });
    jobHandler(deplomentInput);
    
  } catch (error) {
    console.log("Error occurred while processing deployment job", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
