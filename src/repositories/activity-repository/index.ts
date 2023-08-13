import { prisma } from "@/config";

async function getActivity() {
  const result = await prisma.eventDates.findMany({
    include: {
      Activity: {
        include: {
          Venues: true,
        },
      },
    },
  });
  return result;
}

const activityRepository = {
  getActivity,
};

export default activityRepository;
