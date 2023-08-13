import activityRepository from "@/repositories/activity-repository";
import { Activity, EventDates, Venues } from "@prisma/client";

type ResultActivity = Omit<Activity, "updatedAt" | "createdAt" | "venueId" | "eventDateId">;

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
  })[];
}

async function getActivity(): Promise<FormattedData[]> {
  const results = await activityRepository.getActivity();
  const formattedData = await formatActivityData(results);
  return formattedData;
}

async function formatActivityData(results: Results[]): Promise<FormattedData[]> {
  return results.map((result) => {
    const eventDay = result.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

    const venuesData = result.Activity.reduce((acc: VenueObj[], activity) => {
      const venueName = activity.Venues.name;
      const existingVenue = acc.find((venue) => venue.venueName === venueName);

      const formattedActivity: ResultActivity = {
        id: activity.id,
        name: activity.name,
        capacity: activity.capacity,
        startTime: activity.startTime,
        endTime: activity.endTime,
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
