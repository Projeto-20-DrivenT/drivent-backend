import Joi from "joi";
import { InputRegistrationBody } from "@/protocols";

export const registrationSchema = Joi.object<InputRegistrationBody>({
  activityId: Joi.number().required(),
});
