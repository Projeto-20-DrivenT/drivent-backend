import { ApplicationError } from "@/protocols";

export function preconditionFailed(message: string): ApplicationError {
  return {
    name: "PreconditionFailed",
    message: "Precondition not established: " + message,
  };
}
