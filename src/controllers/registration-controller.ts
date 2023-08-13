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
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "PaymentRequired") {
      return res.status(httpStatus.PAYMENT_REQUIRED).send(error.message);
    }
    if (error.name === "PreconditionFailed") {
      return res.status(httpStatus.PRECONDITION_FAILED).send(error.message);
    }
    if (error.name === "ForbiddenRequest") {
      return res.status(httpStatus.FORBIDDEN).send(error.message);
    }
    if (error.name === "ConflictError") {
      return res.status(httpStatus.CONFLICT).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
