import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createHotel,
  createRoomWithHotelId,
  createBooking,
  createEventDate,
  createVenue,
  createActivity,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

interface Activity {
  id: number;
  name: string;
  capacity: number;
  startTime: string;
  endTime: string;
  registration: number;
}

interface Venue {
  venueName: string;
  activity: Activity[];
}

interface Event {
  eventDay: string;
  venue: Venue[];
}

describe("GET /activity", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activity");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user's enrollment is not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if user's ticket is not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 402 when the ticket is not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when ticket is paid", () => {
      it("should respond with status 404 if no booking when activity requires hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 404 if there is no available activity data", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        await createBooking({ roomId: room.id, userId: user.id });

        const response = await server.get("/activity").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 200 and return formatted activity data", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        await createBooking({ roomId: room.id, userId: user.id });

        const eventDate = await createEventDate();
        const venue = await createVenue();
        await createActivity(eventDate.id, venue.id);

        const { status, body } = await server.get("/activity").set("Authorization", `Bearer ${token}`);

        expect(status).toBe(httpStatus.OK);
        expect(Array.isArray(body)).toBe(true);

        body.forEach((event: Event) => {
          expect(event).toHaveProperty("eventDay");
          expect(event).toHaveProperty("venue");

          event.venue.forEach((venue: Venue) => {
            expect(venue).toHaveProperty("venueName");
            expect(venue).toHaveProperty("activity");

            venue.activity.forEach((activity: Activity) => {
              expect(activity).toHaveProperty("id");
              expect(activity).toHaveProperty("name");
              expect(activity).toHaveProperty("capacity");
              expect(activity).toHaveProperty("startTime");
              expect(activity).toHaveProperty("endTime");
              expect(activity).toHaveProperty("registration");
            });
          });
        });
      });
    });
  });
});
