import mongoose, { Document, Model, Schema } from "mongoose";

// Strongly-typed interface for Event documents
export interface EventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO date string
  time: string; // stored as HH:MM (24-hour)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper: create a URL-friendly slug from a title
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace to hyphen
    .replace(/-+/g, "-"); // collapse multiple hyphens
}

// Helper: normalize time strings to HH:MM (24-hour)
function normalizeTime(input: string): string {
  const t = input.trim();
  const re24 = /^([01]?\d|2[0-3]):([0-5]\d)$/; // 0-23:00-59
  const m24 = t.match(re24);
  if (m24) {
    const hh = m24[1].padStart(2, "0");
    const mm = m24[2];
    return `${hh}:${mm}`;
  }

  // Accept 12-hour format with AM/PM
  const re12 = /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM|am|pm)$/;
  const m12 = t.match(re12);
  if (m12) {
    let hour = Number(m12[1]);
    const minute = m12[2];
    const period = m12[3].toUpperCase();
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  throw new Error("Invalid time format. Use HH:MM (24h) or h:MM AM/PM");
}

const EventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: (v: string[]) => Array.isArray(v) && v.length > 0,
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: (v: string[]) => Array.isArray(v) && v.length > 0,
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Pre-save hook: generate/refresh slug only when title changed, and normalize date/time.
EventSchema.pre<EventDocument>("save", async function () {
  // Generate or update slug only if title changed
  if (this.isModified("title")) {
    const base = slugify(this.title);
    let candidate = base;
    let counter = 0;
    const Model = this.constructor as Model<EventDocument>;

    // Ensure slug uniqueness by appending a numeric suffix when needed
    // (loops are safe because collisions are unlikely and capped by existing docs)
    // Exclude current document from search using _id
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const existing = await Model.findOne({
        slug: candidate,
        _id: { $ne: this._id },
      })
        .select("_id")
        .lean();
      if (!existing) break;
      counter += 1;
      candidate = `${base}-${counter}`;
    }
    this.slug = candidate;
  }

  // Normalize date to ISO string and validate
  const parsed = new Date(this.date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date provided; expected a parseable date");
  }
  this.date = parsed.toISOString().slice(0, 10);

  // Normalize time to HH:MM 24-hour format
  this.time = normalizeTime(this.time);
});

// Avoid model recompilation in development (Next.js hot reload)
const Event =
  (mongoose.models.Event as Model<EventDocument>) ||
  mongoose.model<EventDocument>("Event", EventSchema);

export default Event;
export { Event };
