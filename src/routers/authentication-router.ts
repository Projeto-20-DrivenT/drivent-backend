import { singInPost, githubSignPost } from "@/controllers";
import { validateBody } from "@/middlewares";
import { signInSchema, githubSignInSchema } from "@/schemas";
import { Router } from "express";

const authenticationRouter = Router();

authenticationRouter.post("/sign-in", validateBody(signInSchema), singInPost);
authenticationRouter.post("/sign-in/github", validateBody(githubSignInSchema), githubSignPost);

export { authenticationRouter };
