import mongoose, { Document, Model, Schema, Types } from "mongoose";
import Event from "./event.model";

// Strongly-typed interface for Booking documents
export interface BookingDocument extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: (v: string) => emailRegex.test(v),
    },
  },
  { timestamps: true, strict: true },
);

// Index eventId to speed up queries filtering by event
BookingSchema.index({ eventId: 1 });

// Pre-save hook: ensure referenced Event exists before saving booking
// Skip the DB lookup unless the document is new or the `eventId` changed.
BookingSchema.pre<BookingDocument>("save", async function () {
  if (!this.isNew && !this.isModified("eventId")) {
    return;
  }

  // Verify referenced event exists — prevents orphaned bookings
  const exists = await Event.findById(this.eventId).select("_id").lean();
  if (!exists) {
    throw new Error("Referenced event does not exist");
  }
});

// Avoid model recompilation during hot-reload
const Booking =
  (mongoose.models.Booking as Model<BookingDocument>) ||
  mongoose.model<BookingDocument>("Booking", BookingSchema);

export default Booking;
export { Booking };
