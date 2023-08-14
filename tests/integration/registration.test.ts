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

describe("POST /registration", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/registration");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/registration").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/registration").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if body param activityId is missing", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const body = {};

      const response = await server.post("/registration").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 if user's enrollment is not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const body = { activityId: 1 };

      const response = await server.post("/registration").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if user's ticket is not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const body = { activityId: 1 };

      const response = await server.post("/registration").set("Authorization", `Bearer ${token}`).send(body);

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

      const body = { activityId: 1 };

      const response = await server.post("/registration").set("Authorization", `Bearer ${token}`).send(body);
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

        const body = { activityId: 1 };

        const response = await server.post("/registration").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.PRECONDITION_FAILED);
      });

      it("should respond with status 403 if ticketType does not include hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = faker.datatype.boolean();
        const includesHotel = false;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const body = { activityId: 1 };

        const response = await server.post("/registration").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });
    });
  });
});
