import { prisma } from "@/config";

export async function createRegistration(userId: number, activityId: number) {
  return await prisma.registration.create({
    data: {
      userId,
      activityId,
    },
  });
}
