import { ApplicationError } from "@/protocols";

export function forbiddenRequest(message: string): ApplicationError {
  return {
    name: "ForbiddenRequest",
    message: "Forbidden request: " + message,
  };
}
