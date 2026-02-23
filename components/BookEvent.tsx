"use client";
import { createBooking } from "@/lib/actions/booking.action";
import posthog from "posthog-js";
import { useState } from "react";

// interface BookEventProps {
//   eventId: string;
// }

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { success, error } = await createBooking({ eventId, email, slug });

      if (success) {
        setSubmitted(true);
        posthog.capture("event_booked", {
          eventId,
          slug,
          email,
        });
      } else {
        console.error("Booking failed:", error);
        setError("Failed to book your spot. Please try again.");
        posthog.capture("booking_failed", {
          eventId,
          slug,
          email,
        });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-green-600 font-semibold">
          Thank you for booking! We&#39;ll send you an email with the details.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-red-600 font-semibold">{error}</p>}
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email address"
            />
          </div>
          <button type="submit" className="button-submit" disabled={loading}>
            {loading ? "Booking..." : "Book Now"}
          </button>
        </form>
      )}
    </div>
  );
};
export default BookEvent;
