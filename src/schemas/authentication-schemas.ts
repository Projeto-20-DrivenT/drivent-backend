import { SignInParams } from "@/services";
import Joi from "joi";

export const signInSchema = Joi.object<SignInParams>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const githubSignInSchema = Joi.object<{code: string}>({
  code: Joi.string().required(),
});
