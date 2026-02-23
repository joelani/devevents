import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";

// const BaseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const page = async () => {
  "use cache";
  cacheLife("hours"); // Cache this page for 60 seconds
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`,
    );

    if (!response.ok) {
      // Non-2xx response; return safe empty events list
      console.error(
        "Failed fetching events",
        response.status,
        response.statusText,
      );
      return (
        <section>
          <h1 className="text-center">
            The hub for Every Dev <br /> Event you can&#39;t miss!
          </h1>
          <p className="text-center mt-5">Unable to load events right now.</p>
        </section>
      );
    }

    const json = await response.json().catch((err) => {
      console.error("Error parsing events JSON", err);
      return { events: [] } as { events: unknown };
    });

    const { events = [] } = (json as { events?: unknown }) || {};

    return (
      <section>
        <h1 className="text-center">
          The hub for Every Dev <br /> Event you can&#39;t miss!
        </h1>
        <p className="text-center mt-5">
          Hackathons, Meetup, and conferences all in one place
        </p>
        <ExploreBtn />

        <div className="mt-20 space-y-7">
          <h3>Featured Events</h3>
          <ul className="events">
            {Array.isArray(events) && events.length > 0
              ? events.map(
                  (
                    event: IEvent & { _id?: string; slug?: string },
                    idx: number,
                  ) => (
                    <li
                      key={event._id ?? event.slug ?? idx}
                      className="list-none"
                    >
                      <EventCard {...event} />
                    </li>
                  ),
                )
              : null}
          </ul>
        </div>
      </section>
    );
  } catch (err) {
    console.error("Unexpected error loading events page:", err);
    return (
      <section>
        <h1 className="text-center">
          The hub for Every Dev <br /> Event you can&#39;t miss!
        </h1>
        <p className="text-center mt-5">Unable to load events at this time.</p>
      </section>
    );
  }
};

export default page;
