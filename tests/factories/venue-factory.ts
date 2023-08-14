import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createVenue() {
  return await prisma.venues.create({
    data: {
      name: faker.company.companyName(),
      capacity: faker.datatype.number({ min: 30, max: 200 }),
    },
  });
}
