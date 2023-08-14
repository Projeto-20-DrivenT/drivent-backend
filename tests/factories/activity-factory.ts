import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createActivity(eventDateId: number, venueId: number) {
  return await prisma.activity.create({
    data: {
      name: faker.random.words(),
      capacity: faker.datatype.number({ min: 10, max: 100 }),
      startTime: "8:00",
      endTime: "11:00",
      eventDateId,
      venueId,
    },
  });
}
