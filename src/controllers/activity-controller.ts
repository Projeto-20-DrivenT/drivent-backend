import { AuthenticatedRequest } from "@/middlewares";
import activityService from "@/services/activity-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getActivity(req: AuthenticatedRequest, res: Response) {
  try {
    const activity = await activityService.getActivity();
    return res.send(activity);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
