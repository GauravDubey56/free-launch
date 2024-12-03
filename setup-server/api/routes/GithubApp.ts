
import Express, { Request, Response } from "express";
import { asyncHandler, authHandler } from "../utils/middleware";
import * as AppControllers from "../controllers/AppsController";


const router = Express.Router();

router.post(
  "/eventWebhook",
  asyncHandler(AppControllers.webhookHandler)
);
router.get(
  "/getRepositories",
  authHandler,
  asyncHandler(AppControllers.getRepositoriesByUser)
)
router.post(
  "/generateDoc",
  authHandler,
  asyncHandler(AppControllers.generateDocRepository)
);
export default router;
