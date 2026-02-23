import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database/event.model";
import { getSimilarEvents } from "@/lib/actions/event.action";
import Image from "next/image";
import { notFound } from "next/navigation";

const BaseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul className="list-disc list-inside">
      {agendaItems.map((item, idx) => (
        <li key={`${item}-${idx}`}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap flex-row gap-2">
    {tags.map((tag) => (
      <div key={tag} className="pill">
        {tag}
      </div>
    ))}
  </div>
);

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  try {
    const request = await fetch(`${BaseURL}/api/events/${slug}`, {
      cache: "no-store",
    });

    if (!request.ok) {
      if (request.status === 404) return notFound();
      console.error(
        "Failed fetching event",
        request.status,
        request.statusText,
      );
      return notFound();
    }

    const event = await request.json().catch((err) => {
      console.error("Error parsing event JSON", err);
      return null;
    });

    if (!event || typeof event !== "object" || !event.description)
      return notFound();

    const bookings = 10; // Placeholder for actual booking count logic

    const similarEvents: IEvent[] = await getSimilarEvents(slug);

    console.log("Similar Events:", similarEvents);

    return (
      <section id="event">
        <div className="header">
          <h1>Event Description</h1>
          <p className="">{event.description}</p>
        </div>
        <div className="details">
          {/* Left Side:  Event content*/}
          <div className="content">
            <Image
              src={event.image}
              alt="Event banner"
              width={800}
              height={800}
              className="banner"
            />

            <section className="flex-col-gap-2">
              <h2>Overview</h2>
              <p>{event.overview}</p>
            </section>
            <section className="flex-col-gap-2">
              <h2>Event Details</h2>
              <EventDetailItem
                icon="/icons/calendar.svg"
                alt="Calendar icon"
                label={`${event.date} at ${event.time}`}
              />
              <EventDetailItem
                icon="/icons/pin.svg"
                alt="Location icon"
                label={`${event.venue}, ${event.location}`}
              />
              <EventDetailItem
                icon="/icons/mode.svg"
                alt="Mode icon"
                label={`Mode: ${event.mode}`}
              />
              <EventDetailItem
                icon="/icons/audience.svg"
                alt="Audience icon"
                label={`Audience: ${event.audience}`}
              />
            </section>
            <EventAgenda agendaItems={event.agenda} />

            <section className="flex-col-gap-2">
              <h2>About the Organizer</h2>
              <p>{event.organizer}</p>
            </section>

            <EventTags tags={event.tags} />
          </div>
          {/* Right side: Booking form */}
          <aside className="booking">
            <div className="signup-card">
              <h2>Book Your Spot</h2>
              {bookings > 0 ? (
                <p className="text-sm">
                  Join {bookings} others attending this event!
                </p>
              ) : (
                <p className="text-sm">Be the first to book your spot</p>
              )}
              <BookEvent eventId={event._id} />
            </div>
          </aside>
        </div>

        <h2 className="">Similar Events</h2>
        <div className="flex w-full flex-col gap-4 pt-20">
          <div className="events">
            {similarEvents.length > 0 &&
              similarEvents.map((similarEvent: IEvent) => (
                <EventCard key={similarEvent.title} {...similarEvent} />
              ))}
          </div>
        </div>
      </section>
    );
  } catch (err) {
    console.error("Unexpected error fetching event:", err);
    return notFound();
  }
};

export default EventDetailsPage;
