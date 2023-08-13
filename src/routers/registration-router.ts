import { createRegistration } from "@/controllers/registration-controller";
import { authenticateToken, validateBody } from "@/middlewares";
import { registrationSchema } from "@/schemas/registration-schemas";
import { Router } from "express";

const registrationRouter = Router();

registrationRouter.all("/*", authenticateToken);
registrationRouter.post("/", validateBody(registrationSchema), createRegistration);

export { registrationRouter };
