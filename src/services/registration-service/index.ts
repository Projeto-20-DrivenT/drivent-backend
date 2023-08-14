import { conflictError, forbiddenRequest, notFoundError, paymentRequired, preconditionFailed } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import registrationRepository from "@/repositories/registration-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function createRegistration(userId: number, activityId: number) {
  const result = await enrollmentRepository.findEnrollmentAndTicketByUserId(userId);
  const ticket = result?.Ticket[0];

  if (!result || !ticket) {
    throw notFoundError();
  }

  if (ticket.status !== "PAID") {
    throw paymentRequired();
  }
  
  const ticketType = await ticketRepository.getTicketType(ticket.ticketTypeId);
  const booking = await bookingRepository.findByUserId(userId);

  if(ticketType.includesHotel && !booking) {
    throw preconditionFailed("Need to book hotel room in advance!");
  }

  if(!ticketType.includesHotel) {
    const message = "If you do not include a hotel, you have access to all activities, therefore registration is not allowed.";
    throw forbiddenRequest(message);
  }

  const activityWithRegistrations = await activityRepository.getActivityWithRegistrationsByActivityId(activityId);
  const registrations= activityWithRegistrations.Registration;

  if( activityWithRegistrations.capacity >= registrations.length ) {
    throw conflictError("Cannot registration in this activity! Overcapacity!");
  }

  if( isActivityTimeConflict(userId, activityWithRegistrations.startTime, activityWithRegistrations.endTime)) {
    throw conflictError("Time conflict. The new activity overlaps the activities already registered");
  }

  const createRegistration = await registrationRepository.createRegistration(userId, activityId);
  return createRegistration;
}

async function isActivityTimeConflict(userId: number, newStartTime: string, newEndTime: string) {
  const userActivities = await activityRepository.getActivityByUserId(userId);

  for (const activity of userActivities) {
    const existingStartTime = activity.startTime;
    const existingEndTime = activity.endTime;

    if (
      (newStartTime >= existingStartTime && newStartTime < existingEndTime) ||
      (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
      (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
    ) {
      return true;
    }
  }

  return false;
}

const registrationService = {
  createRegistration,
};

export default registrationService;
