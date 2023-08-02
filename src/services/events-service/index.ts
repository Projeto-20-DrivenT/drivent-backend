import { notFoundError } from "@/errors";
import eventRepository from "@/repositories/event-repository";
import { exclude } from "@/utils/prisma-utils";
import { Event } from "@prisma/client";
import dayjs from "dayjs";
import redis, { DEFAULT_EXP } from "@/config/redis";

async function getFirstEvent(): Promise<GetFirstEventResult> {
  const eventsKey = "events";
  await redis.connect();

  let event: Event;
  const result = await redis.get(eventsKey);
  if (result) event = JSON.parse(result);
  else {
    event = await eventRepository.findFirst();
    if (!event) {
      await redis.quit();
      throw notFoundError();
    }
    await redis.setEx(eventsKey, DEFAULT_EXP, JSON.stringify(event));
  }

  await redis.quit();
  return exclude(event, "createdAt", "updatedAt");
}

export type GetFirstEventResult = Omit<Event, "createdAt" | "updatedAt">;

async function isCurrentEventActive(): Promise<boolean> {
  const eventsKey = "events";
  await redis.connect();

  let event: Event;
  const result = await redis.get(eventsKey);
  if (result) event = JSON.parse(result);
  else {
    event = await eventRepository.findFirst();
    if (!event) {
      await redis.quit();
      return false;
    }
    await redis.setEx(eventsKey, DEFAULT_EXP, JSON.stringify(event));
  }

  const now = dayjs();
  const eventStartsAt = dayjs(event.startsAt);
  const eventEndsAt = dayjs(event.endsAt);

  await redis.quit();
  return now.isAfter(eventStartsAt) && now.isBefore(eventEndsAt);
}

const eventsService = {
  getFirstEvent,
  isCurrentEventActive,
};

export default eventsService;
