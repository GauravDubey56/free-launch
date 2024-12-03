import Express from "express";
import { asyncHandler, authHandler } from "../utils/middleware";

import * as AppsController from "../controllers/AppsController";
const router = Express.Router();

router.post(
  "/client/app",
  authHandler,
  asyncHandler(AppsController.createNewApp)
);
router.get(
  "/client/app",
  authHandler,
  asyncHandler(AppsController.getClientApps)
);
router.patch(
  "/client/app",
  authHandler,
  asyncHandler(AppsController.updateApp)
);

export default router;
