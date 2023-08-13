import { getActivity } from "@/controllers/activity-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const activityRouter = Router();

activityRouter.all("/*", authenticateToken);
activityRouter.get("/", getActivity);

export { activityRouter };
