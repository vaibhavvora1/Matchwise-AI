import { Router } from "express";
import {
  getUserByIdController,
  listUsersController,
  updateUserRoleController,
  updateUserStatusController,
} from "../controllers/user.controller.js";
import { adminAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validation.middleware.js";

const userRouter = Router();

// Require authentication and admin role on all user management endpoints
userRouter.use(adminAuth, requireAdmin);

userRouter.get("/", listUsersController);
userRouter.get("/:id", validateObjectId("id"), getUserByIdController);
userRouter.patch("/:id/status", validateObjectId("id"), updateUserStatusController);
userRouter.patch("/:id/role", validateObjectId("id"), updateUserRoleController);

export default userRouter;
