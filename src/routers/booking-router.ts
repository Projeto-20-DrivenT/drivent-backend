import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { bookingRoom, listBooking, changeBooking, listBookingByRoomId } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("", listBooking)
  .get("/rooms/:roomId", listBookingByRoomId)
  .post("", bookingRoom)
  .put("/:bookingId", changeBooking);

export { bookingRouter };
