import { init } from "@/app";
import redis from "@/config/redis";
import { createEvent } from "../factories";
import { cleanDb } from "../helpers";
import eventRepository from "@/repositories/event-repository";
import eventsService from "@/services/events-service";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe("Events service unit tests", () => {
  it("getFirstEvent should retrieve event data from redis", async () => {
    const event = await createEvent();

    const mock = jest.spyOn(redis, "get").mockImplementationOnce((): any => {
      return JSON.stringify(event);
    });

    const mockRepository = jest.spyOn(eventRepository, "findFirst").mockImplementationOnce((): any => {
      return true;
    });

    await eventsService.getFirstEvent();
    expect(mock).toBeCalledTimes(1);
    expect(mockRepository).toBeCalledTimes(0);
  });
  it("getFirstEvent should retrieve event data from postgres", async () => {
    const mock = jest.spyOn(redis, "get").mockImplementationOnce((): any => {
      return false;
    });

    const mockRepository = jest.spyOn(eventRepository, "findFirst").mockImplementationOnce((): any => {
      return true;
    });

    const mockSet = jest.spyOn(redis, "setEx").mockImplementationOnce((): any => {
      return false;
    });

    await eventsService.getFirstEvent();

    expect(mock).toBeCalledTimes(1);
    expect(mockRepository).toBeCalledTimes(1);
    expect(mockSet).toBeCalledTimes(1);
  });
  it("isCurrentEventActive should retrieve event data from redis", async () => {
    const event = await createEvent();

    const mock = jest.spyOn(redis, "get").mockImplementationOnce((): any => {
      return JSON.stringify(event);
    });

    const mockRepository = jest.spyOn(eventRepository, "findFirst").mockImplementationOnce((): any => {
      return true;
    });

    await eventsService.isCurrentEventActive();
    expect(mock).toBeCalledTimes(1);
    expect(mockRepository).toBeCalledTimes(0);
  });
  it("isCurrentEventActive should retrieve event data from postgres", async () => {
    const mock = jest.spyOn(redis, "get").mockImplementationOnce((): any => {
      return false;
    });

    const mockRepository = jest.spyOn(eventRepository, "findFirst").mockImplementationOnce((): any => {
      return true;
    });

    const mockSet = jest.spyOn(redis, "setEx").mockImplementationOnce((): any => {
      return false;
    });

    await eventsService.isCurrentEventActive();

    expect(mock).toBeCalledTimes(1);
    expect(mockRepository).toBeCalledTimes(1);
    expect(mockSet).toBeCalledTimes(1);
  });
});
