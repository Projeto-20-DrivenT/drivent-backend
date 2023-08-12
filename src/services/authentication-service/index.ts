import sessionRepository from "@/repositories/session-repository";
import userRepository from "@/repositories/user-repository";
import { exclude } from "@/utils/prisma-utils";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { invalidCredentialsError } from "./errors";
import axios from "axios";

async function signIn(params: SignInParams): Promise<SignInResult> {
  const { email, password } = params;

  const user = await getUserOrFail(email);

  await validatePasswordOrFail(password, user.password);

  const token = await createSession(user.id);

  return {
    user: exclude(user, "password"),
    token,
  };
}

async function getUserOrFail(email: string): Promise<GetUserOrFailResult> {
  const user = await userRepository.findByEmail(email, { id: true, email: true, password: true });
  if (!user) throw invalidCredentialsError();

  return user;
}

async function createSession(userId: number) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  await sessionRepository.create({
    token,
    userId,
  });

  return token;
}

async function validatePasswordOrFail(password: string, userPassword: string) {
  const isPasswordValid = await bcrypt.compare(password, userPassword);
  if (!isPasswordValid) throw invalidCredentialsError();
}

async function githubSignIn(code: string){

  const result = await axios.post("https://github.com/login/oauth/access_token",{
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code
  }, {
    headers: {Accept: 'application/json'}
  })

  const {data} = await axios.get("https://api.github.com/user",{
    headers: {
      Authorization: `Bearer ${result.data.access_token}`
    }
  })
  
  const email = data.email ? data.email : data.login
  let user = await userRepository.findByEmail(email, { id: true, email: true});

  if(!user){
    user = await userRepository.create({
      email,
      password: jwt.sign({ email, id: data.id, token: result.data.access_token }, process.env.JWT_SECRET),
    })

    delete user.createdAt
    delete user.updatedAt
  }

  const token = await createSession(user.id);
  return {
    user: exclude(user, "password"),
    token
  }
}

export type SignInParams = Pick<User, "email" | "password">;

type SignInResult = {
  user: Pick<User, "id" | "email">;
  token: string;
};

type GetUserOrFailResult = Pick<User, "id" | "email" | "password">;

const authenticationService = {
  signIn,
  githubSignIn
};

export default authenticationService;
export * from "./errors";
