const axios = require("axios");

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const generateS3Key = (layerName) => {
  const currentDate = new Date().toISOString().split("T")[0];
  const FILE_KEY = `${layerName}_${Date.now().toString()}.zip`;
  return { S3_KEY: `${currentDate}/${FILE_KEY}`, FILE_KEY };
};

class ExpressAppHandler {
  deplomentInput = {
    deploymentId: "",
    lambdaFunctionName: "",
    repoZipUrl: "",
  };
  deploymentHandlerVars = {
    zipLocation: "",
    destDir: "",
    expressAppLocation: "",
    tempDir: "",
  };
  deploymentOutput = {
    deploymentId: "",
    lambdaFunctionName: "",
    layerName: "",
    layerVersion: "",
    repoZipUrl: "",
    status: "",
    message: "",
    completedAt: "",
  };

  constructor(deploymentId, lambdaFunctionName, repoZipUrl) {
    this.deplomentInput.deploymentId = deploymentId;
    this.deplomentInput.lambdaFunctionName = lambdaFunctionName;
    this.deplomentInput.repoZipUrl = repoZipUrl;
  }

  createTempDirForRepo = () => {
    this.deploymentHandlerVars.tempDir = process.cwd();
    const tempDir = `${this.deploymentHandlerVars.tempDir}/repoZips`;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const repoName = `deployment_${this.deplomentInput.deploymentId}`;
    const localFilename = `${tempDir}/${repoName}_${Date.now().toString()}.zip`;
    console.log("localFilename", localFilename);
    this.deploymentHandlerVars.zipLocation = localFilename;
  };
  async downloadRepo() {
    const githubRepoUrl = this.deplomentInput.repoZipUrl;
    try {
      const response = await axios({
        method: "get",
        url: githubRepoUrl,
        responseType: "stream",
      });

      const localKey = this.deploymentHandlerVars.zipLocation;

      const writer = fs.createWriteStream(localKey);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve("success"));
        writer.on("error", (err) => reject(err));
      });
    } catch (error) {
      console.error("Error downloading GitHub repository:", error);
    }
  }
  unlinkTempDir() {
    try {
      // cleanup /repoDir and /repoZips
      const tempDirPath = `${this.deploymentHandlerVars.tempDir}/repoZips`;
      if (fs.existsSync(tempDirPath)) {
        fs.rmdirSync(tempDirPath, { recursive: true });
      }
    } catch (error) {
      console.error("Error deleting temp directory:", error);
    }
  }
  unlinkRepo() {
    const destDirPath = `${this.deploymentHandlerVars.destDir}`;
    if (fs.existsSync(destDirPath)) {
      fs.rmdirSync(destDirPath, { recursive: true });
    }
  }
  findPackageJson(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory() && !filePath.includes("node_modules")) {
        // If it's a directory, recursively search inside
        const packageJsonPath = findPackageJson(filePath);
        if (packageJsonPath) {
          return packageJsonPath;
        }
      } else if (file === "package.json") {
        // If it's a package.json file, return its path
        return filePath;
      }
    }

    return null; // Package.json not found in this directory or its subdirectories
  }

  extractZip() {
    const osTempDir = process.cwd() + "/repoDir";
    const zipPath = this.deploymentHandlerVars.zipLocation;
    if (!fs.existsSync(osTempDir)) {
      fs.mkdirSync(osTempDir, { recursive: true });
    }
    const destDir = `${osTempDir}`;
    this.deploymentHandlerVars.destDir = osTempDir;
    console.log("destDir", destDir);
    execSync(`unzip -o ${zipPath} -d ${destDir}`);
    const extractedItems = fs.readdirSync(destDir);
    let extractedDir = "";
    for (const item of extractedItems) {
      if (fs.statSync(`${destDir}/${item}`).isDirectory()) {
        extractedDir = item;
        break;
      }
    }
    if (extractedDir) {
      const extractedPath = `${destDir}/${extractedDir}`;
      const files = fs.readdirSync(extractedPath);
      files.forEach((file) => {
        fs.renameSync(`${extractedPath}/${file}`, `${destDir}/${file}`);
      });
      fs.rmdirSync(extractedPath);
    } else {
      throw new Error("No directory found in the extracted items");
    }
    const pathTillIndexFile = destDir;
    console.log("pathTillIndexFile", pathTillIndexFile);
  }

  prepareLambda() {
    console.log("Preparing Lambda package...");
    // main express app is in repoDir and app is exported from index.js
    const DIST_DIR = this.deploymentHandlerVars.destDir;
    const appPath = "app.js"; // or the correct path to your app
    const handlerContent = `
      const serverless = require('serverless-http');
      const app = require('./${appPath}');
      module.exports.handler = serverless(app);
    `;
    fs.writeFileSync(path.join(DIST_DIR, "index.js"), handlerContent);
    // install serverless-http
    // load AWS credentials
    execSync(`export AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID}`, {
      cwd: DIST_DIR,
      stdio: "inherit",
    });
    execSync(
      `export AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY}`,
      { cwd: DIST_DIR, stdio: "inherit" }
    );

    execSync("npm install serverless-http", {
      cwd: DIST_DIR,
      stdio: "inherit",
    });
    execSync("npm install --production", { cwd: DIST_DIR, stdio: "inherit" });
    console.log("Lambda package ready.");

    // Create serverless.yml file
    const serverlessYmlContent = `

    service: ${this.deplomentInput.lambdaFunctionName}

    provider:
      name: aws
      runtime: nodejs18.x
      stage: dev
      region: ap-south-1
    
    functions:
      app:
        handler: index.handler
        events:
          - http:
              path: /
              method: any
          - http:
              path: /{proxy+}
              method: any
      
    `;

    fs.writeFileSync(
      path.join(DIST_DIR, "serverless.yml"),
      serverlessYmlContent
    );

    // Deploy using serverless framework
    execSync("npx serverless deploy", { cwd: DIST_DIR, stdio: "inherit" });
    console.log("Lambda function deployed successfully.");
  }
}

module.exports = ExpressAppHandler;
