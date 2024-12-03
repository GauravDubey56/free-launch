import express, { Express, Request, Response } from 'express';
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+ '/.env' });
import os from 'os';
import bodyParser from 'body-parser';
import AuthRouter from './routes/Auth'
import AppRouter from './routes/Projects';
import GithubAppRouter from './routes/GithubApp';
import { nextErrorHandler } from './utils/middleware';

const app: Express = express();
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const port = process.env.PORT;
app.use(jsonParser);
app.use(urlencodedParser);
app.get('/health', (req: Request, res: Response) => {
    res.send(`Server running at port ${port}`);
});
app.use('/auth',AuthRouter)
app.use(AppRouter)
app.use('/githubApp', GithubAppRouter);

app.use(nextErrorHandler);

if (process.env.SERVER_DEPLOYMENT != "aws_lambda") {
  app.listen(port, () => {
    console.log(`Server is running at ${os.hostname()}:${port}`);
  });
} else {
  console.log(`Deployment variable set to AWS LAMDBA`)
}
export default app;