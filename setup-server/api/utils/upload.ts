import AWS from 'aws-sdk'
import axios from 'axios'
import moment from 'moment';
import AmazonS3URI from 'amazon-s3-uri';
import os from 'os';
import fs from 'fs';
import { Readable } from 'stream';
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ADMIN_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ADMIN_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})
async function downloadGitHubRepo(githubRepoUrl: string, localKey: string) {
    try {
      const response = await axios({
        method: 'get',
        url: githubRepoUrl,
        responseType: 'stream'
      });

      response.data.pipe(fs.createWriteStream(localKey));
      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve('sucess'));
        response.data.on('error', (err: any) => reject(err));
      });
    } catch (error) {
      console.error('Error downloading GitHub repository:', error);
    }
  }
export const uploadGithubRepo = async ({repoZipUrl, repoName, userId}: any) => {
  const tempDir = os.tmpdir();
  const localFilename = `${tempDir}/${repoName}_${Date.now().toString()}.zip`;
  const key = `USERID${userId}/${repoName}/${moment().format(
    "YYYY-MM-DD"
  )}/${Date.now().toString()}.zip`;
  await downloadGitHubRepo(repoZipUrl, localFilename);
  const params = {
    Bucket: String(process.env.REPO_STORAGE_BUCKET),
    Key: key,
    Body: fs.createReadStream(localFilename),
  };
  const file = await s3.upload(params).promise();
  fs.unlinkSync(localFilename)
  const signedUrl = await getSignedUrl(file.Location);
  return {
    uploadUrl: file.Location,
    signedUrl
  }
}


export const getSignedUrl = async (s3Url: string) => {
  const params = new AmazonS3URI(s3Url);
  const signedUrl = await s3.getSignedUrlPromise("getObject", {
    Bucket: params.bucket,
    Key: params.key,
  });
  return signedUrl;
};