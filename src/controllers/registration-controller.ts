import { AuthenticatedRequest } from "@/middlewares";
import registrationService from "@/services/registration-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function createRegistration(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const activityId = Number(req.body.activityId);

  try {
    const registration = await registrationService.createRegistration(userId, activityId);
    return res.status(httpStatus.CREATED).send(registration);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
