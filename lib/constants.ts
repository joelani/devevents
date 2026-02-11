export type EventItem = {
  title: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  image: string;
};

export const events: EventItem[] = [
  {
    title: "React Conf 2026",
    slug: "react-conf-2026",
    location: "San Francisco, USA",
    date: "May 15-17, 2026",
    time: "9:00 AM",
    image: "/images/event1.png",
  },
  {
    title: "Web Summit 2026",
    slug: "web-summit-2026",
    location: "Lisbon, Portugal",
    date: "June 8-10, 2026",
    time: "10:00 AMM",
    image: "/images/event2.png",
  },
  {
    title: "JavaScript Conference EU",
    slug: "javascript-conference-eu",
    location: "Berlin, Germany",
    date: "July 22-24, 2026",
    time: "9:30 AM",
    image: "/images/event3.png",
  },
  {
    title: "Next.js Conf 2026",
    slug: "nextjs-conf-2026",
    location: "Austin, USA",
    date: "August 19-20, 2026",
    time: "8:00 AM ",
    image: "/images/event4.png",
  },
  {
    title: "DevOps Days Global",
    slug: "devops-days-global",
    location: "Amsterdam, Netherlands",
    date: "September 3-5, 2026",
    time: "9:00 AM",
    image: "/images/event5.png",
  },
  {
    title: "TypeScript Congress 2026",
    slug: "typescript-congress-2026",
    location: "Singapore",
    date: "October 14-16, 2026",
    time: "9:30 AM",
    image: "/images/event6.png",
  },
];
