import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { bookingRoom, listBooking, changeBooking, listBookingByRoomId, listBookingByHotelId } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("", listBooking)
  .get("/rooms/:roomId", listBookingByRoomId)
  .get("/hotels/:hotelId", listBookingByHotelId)
  .post("", bookingRoom)
  .put("/:bookingId", changeBooking);

export { bookingRouter };
