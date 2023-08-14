import { notFoundError, paymentRequired } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Activity, EventDates, Registration, Venues } from "@prisma/client";

type ResultActivity = Omit<Activity, "updatedAt" | "createdAt" | "venueId" | "eventDateId"> & { registration: number };

type VenueObj = {
  venueName: string;
  activity: ResultActivity[];
}

type FormattedData = {
  eventDay: string;
  venue: VenueObj[];
}

type Results = EventDates & {
  Activity: (Activity & {
      Venues: Venues;
      Registration: Registration[];
  })[];
}

async function getActivity(userId: number): Promise<FormattedData[]> {
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
    throw notFoundError();
  }

  const activityData = await activityRepository.getActivity();
  if(activityData.length === 0) {
    throw notFoundError();
  }
  const formattedData = await formatActivityData(activityData);
  return formattedData;
}

async function formatActivityData(results: Results[]): Promise<FormattedData[]> {
  return results.map((result) => {
    const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dayOfWeek = daysOfWeek[result.date.getDay()];
    const dayAndMonth = result.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const eventDay = `${dayOfWeek}, ${dayAndMonth}`;

    const venuesData = result.Activity.reduce((acc: VenueObj[], activity) => {
      const venueName = activity.Venues.name;
      const existingVenue = acc.find((venue) => venue.venueName === venueName);

      const formattedActivity: ResultActivity = {
        id: activity.id,
        name: activity.name,
        capacity: activity.capacity,
        startTime: activity.startTime,
        endTime: activity.endTime,
        registration: activity.Registration.length,
      };

      if (existingVenue) {
        existingVenue.activity.push(formattedActivity);
      } else {
        acc.push({
          venueName,
          activity: [formattedActivity],
        });
      }
      return acc;
    }, []);

    return {
      eventDay,
      venue: venuesData,
    };
  });
}

const activityService = {
  getActivity,
};

export default activityService;
