import { prisma } from "@/config";

async function createRegistration(userId: number, activityId: number) {
  return await prisma.registration.create({
    data: {
      userId,
      activityId,
    },
  });
}

const registrationRepository = {
  createRegistration,
};

export default registrationRepository;
