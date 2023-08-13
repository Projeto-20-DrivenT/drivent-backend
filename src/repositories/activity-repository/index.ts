import { prisma } from "@/config";

async function getActivity() {
  const result = await prisma.eventDates.findMany({
    include: {
      Activity: {
        include: {
          Venues: true,
          Registration: true,
        },
      },
    },
  });
  return result;
}

async function getActivityWithRegistrationsByActivityId(activityId: number) {
  return await prisma.activity.findFirst({
    where: {
      id: activityId,
    },
    include: {
      Registration: true,
    }
  });
}

async function getActivityByUserId(userId: number) {
  return await prisma.activity.findMany({
    where: {
      Registration: {
        some: {
          userId: userId
        }
      }
    }
  });
}

const activityRepository = {
  getActivity,
  getActivityWithRegistrationsByActivityId,
  getActivityByUserId,
};

export default activityRepository;
