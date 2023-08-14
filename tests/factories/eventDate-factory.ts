import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createEventDate() {
  return await prisma.eventDates.create({
    data: {
      date: faker.date.future(),
    },
  });
}
