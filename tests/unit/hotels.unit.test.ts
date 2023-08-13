import { init } from "@/app";
import { redisClient } from "@/config/redis";
import { createHotel } from "../factories";
import { cleanDb } from "../helpers";
import hotelService from "@/services/hotels-service";
import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
  await redisClient.flushDb();
});

describe("Hotels service unit tests", () => {
  it("getHotels should retrieve event data from redis", async () => {
    const hotel = await createHotel();

    const mock = jest.spyOn(redisClient, "get").mockImplementationOnce((): any => {
      return JSON.stringify(hotel);
    });

    const mockRepository = jest.spyOn(hotelRepository, "findHotels").mockImplementationOnce((): any => {
      return true;
    });

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
      return true;
    });

    jest.spyOn(ticketRepository, "findTicketByEnrollmentId").mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: "PAID",
        TicketType: {
          isRemote: false,
          includesHotel: true,
        },
      };
    });

    await hotelService.getHotels(1);

    expect(mock).toBeCalledTimes(1);
    expect(mockRepository).toBeCalledTimes(0);
  });
  it("getHotels should retrieve event data from postgres", async () => {
    createHotel();

    const mock = jest.spyOn(redisClient, "get").mockImplementationOnce((): any => {
      return false;
    });

    const mockRepository = jest.spyOn(hotelRepository, "findHotels").mockImplementationOnce((): any => {
      return true;
    });

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
      return true;
    });

    jest.spyOn(ticketRepository, "findTicketByEnrollmentId").mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: "PAID",
        TicketType: {
          isRemote: false,
          includesHotel: true,
        },
      };
    });

    const mockSet = jest.spyOn(redisClient, "setEx").mockImplementationOnce((): any => {
      return false;
    });

    await hotelService.getHotels(1);

    expect(mock).toBeCalledTimes(1);
    expect(mockRepository).toBeCalledTimes(1);
    expect(mockSet).toBeCalledTimes(1);
  });
  it("getHotelsWithRooms should retrieve event data from redis", async () => {
    const hotel = await createHotel();

    const mock = jest.spyOn(redisClient, "get").mockImplementationOnce((): any => {
      return JSON.stringify(hotel);
    });

    const mockRepository = jest.spyOn(hotelRepository, "findRoomsByHotelId").mockImplementationOnce((): any => {
      return true;
    });

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
      return true;
    });

    jest.spyOn(ticketRepository, "findTicketByEnrollmentId").mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: "PAID",
        TicketType: {
          isRemote: false,
          includesHotel: true,
        },
      };
    });

    await hotelService.getHotelsWithRooms(1, hotel.id);
    expect(mock).toBeCalledTimes(1);
    expect(mockRepository).toBeCalledTimes(0);
  });
  it("getHotelsWithRooms should retrieve event data from postgres", async () => {
    const hotel = await createHotel();

    const mock = jest.spyOn(redisClient, "get").mockImplementationOnce((): any => {
      return false;
    });

    const mockRepository = jest.spyOn(hotelRepository, "findRoomsByHotelId").mockImplementationOnce((): any => {
      return true;
    });

    jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
      return true;
    });

    jest.spyOn(ticketRepository, "findTicketByEnrollmentId").mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: "PAID",
        TicketType: {
          isRemote: false,
          includesHotel: true,
        },
      };
    });

    const mockSet = jest.spyOn(redisClient, "setEx").mockImplementationOnce((): any => {
      return false;
    });

    await hotelService.getHotelsWithRooms(1, hotel.id);

    expect(mock).toBeCalledTimes(1);
    expect(mockRepository).toBeCalledTimes(1);
    expect(mockSet).toBeCalledTimes(1);
  });
});
