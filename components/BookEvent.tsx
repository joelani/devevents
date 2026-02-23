"use client";
import { useState } from "react";

interface BookEventProps {
  eventId: string;
}

const BookEvent = ({ eventId }: BookEventProps) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate async booking process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Here you would typically send the email and eventId to your backend API
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book event");
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
