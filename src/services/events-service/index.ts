import { notFoundError } from "@/errors";
import eventRepository from "@/repositories/event-repository";
import { exclude } from "@/utils/prisma-utils";
import { Event } from "@prisma/client";
import dayjs from "dayjs";
import { redisClient, DEFAULT_EXP } from "@/config/redis";

async function getFirstEvent(): Promise<GetFirstEventResult> {
  const eventsKey = "events";

  let event: Event;

  const result = await redisClient.get(eventsKey);

  if (result) {
    event = JSON.parse(result);
  } else {
    event = await eventRepository.findFirst();

    if (!event) {
      throw notFoundError();
    }

    await redisClient.setEx(eventsKey, DEFAULT_EXP, JSON.stringify(event));
  }

  return exclude(event, "createdAt", "updatedAt");
}

export type GetFirstEventResult = Omit<Event, "createdAt" | "updatedAt">;

async function isCurrentEventActive(): Promise<boolean> {
  const eventsKey = "events";

  let event: Event;
  const result = await redisClient.get(eventsKey);
  if (result) {
    event = JSON.parse(result);
  } else {
    event = await eventRepository.findFirst();
    if (!event) {
      return false;
    }
    await redisClient.setEx(eventsKey, DEFAULT_EXP, JSON.stringify(event));
  }

  const now = dayjs();
  const eventStartsAt = dayjs(event.startsAt);
  const eventEndsAt = dayjs(event.endsAt);

  return now.isAfter(eventStartsAt) && now.isBefore(eventEndsAt);
}

const eventsService = {
  getFirstEvent,
  isCurrentEventActive,
};

export default eventsService;
