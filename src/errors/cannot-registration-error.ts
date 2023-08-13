import { ApplicationError } from "@/protocols";

export function cannotRegistrationError(): ApplicationError {
  return {
    name: "CannotRegistrationError",
    message: "Cannot registration in this activity! Overcapacity!",
  };
}
