import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { generateCPF, getStates } from '@brazilian-utils/brazilian-utils';
import { options } from 'joi';

const prisma = new PrismaClient();

async function createEvent() {
  console.log('Creating event...');

  return prisma.event.create({
    data: {
      title: 'Driven.t',
      logoImageUrl:
        'https://uploads-ssl.webflow.com/62235d098ddf9185c2d74422/63501c4f05bcfe3a3ce9327a_logo_pink%20(1).png',
      backgroundImageUrl: 'linear-gradient(to right, #FA4098, #FFD77F)',
      startsAt: dayjs().toDate(),
      endsAt: dayjs().add(21, 'days').toDate(),
    },
  });
}

function getRooms() {
  const roomNumberMapper = (n: number, index: number) => {
    return {
      name: (n + index).toString(),
      capacity: 3,
    };
  };

  const firstFloor = Array(10).fill(101).map(roomNumberMapper);
  const secondFloor = Array(10).fill(201).map(roomNumberMapper);

  return [...firstFloor, ...secondFloor];
}

async function createHotels() {
  console.log('Creating hotels...');

  const images = [
    'https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg',
    'https://forbes.com.br/wp-content/uploads/2022/02/Life_Forbes-Travel-Guide-os-40-melhores-hoteis-que-chegam-em-2022-768x512.jpg',
  ];

  const hotels = images.map((image, index) => {
    return {
      image,
      name: `Hotel ${(index + 1).toString().padStart(2, '0')}`,
      Rooms: {
        create: getRooms(),
      },
    };
  });

  return Promise.all(hotels.map((data) => prisma.hotel.create({ data })));
}

interface CreateScenarioParams {
  email: string;
  isRemote: boolean;
  includesHotel: boolean;
}

async function createScenario(options: CreateScenarioParams) {
  const { email, isRemote, includesHotel } = options;
  const price = faker.datatype.number();
  console.log('\nCreating user:');
  console.log({ ...options, password: 'password' });

  return prisma.user.create({
    data: {
      email,
      password: bcrypt.hashSync('password', 12),
      Enrollment: {
        create: {
          name: faker.name.findName(),
          cpf: generateCPF(),
          birthday: faker.date.past(),
          phone: faker.phone.phoneNumber('(##) 9####-####'),
          Address: {
            create: {
              street: faker.address.streetName(),
              cep: faker.address.zipCode(),
              city: faker.address.city(),
              neighborhood: faker.address.city(),
              number: faker.datatype.number().toString(),
              state: faker.helpers.arrayElement(getStates()).code,
            },
          },
          Ticket: {
            create: {
              status: 'PAID',
              TicketType: {
                create: {
                  price,
                  includesHotel,
                  isRemote,
                  name: faker.name.findName(),
                },
              },
              Payment: {
                create: {
                  cardIssuer: faker.name.findName(),
                  cardLastDigits: faker.datatype.number({ min: 0, max: 9999 }).toString().padStart(4, '0'),
                  value: price,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function main() {
  await Promise.all([
    createEvent(),
    createHotels(),
    createScenario({ email: 'ticketonly@email.com', isRemote: false, includesHotel: false }),
    createScenario({ email: 'hotel@email.com', isRemote: false, includesHotel: true }),
    createScenario({ email: 'remote@email.com', isRemote: true, includesHotel: false }),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
