import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import redis, { DEFAULT_EXP } from "@/config/redis";
import { Hotel, Room } from "@prisma/client";

async function listHotels(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function getHotels(userId: number) {
  await listHotels(userId);

  const hotelsKey = "hotels";
  await redis.connect();

  let hotels: Hotel[];
  const result = await redis.get(hotelsKey);
  if (result) hotels = JSON.parse(result);
  else {
    hotels = await hotelRepository.findHotels();
    if (!hotels) {
      await redis.quit();
      throw notFoundError();
    }
    await redis.setEx(hotelsKey, DEFAULT_EXP, JSON.stringify(hotels));
  }

  await redis.quit();
  return hotels;
}

async function getHotelsWithRooms(userId: number, hotelId: number) {
  await listHotels(userId);

  const hotelKey = `hotelId=${hotelId}`;
  await redis.connect();

  let hotels: Hotel & { Rooms: Room[] };
  const result = await redis.get(hotelKey);
  if (result) hotels = JSON.parse(result);
  else {
    hotels = await hotelRepository.findRoomsByHotelId(hotelId);
    if (!hotels) {
      await redis.quit();
      throw notFoundError();
    }
    await redis.setEx(hotelKey, DEFAULT_EXP, JSON.stringify(hotels));
  }

  await redis.quit();
  return hotels;
}

const hotelService = {
  getHotels,
  getHotelsWithRooms,
};

export default hotelService;
