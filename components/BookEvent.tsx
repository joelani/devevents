"use client";
import { useState } from "react";

const BookEvent = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend or an API
    console.log("Booking email:", email);
    setTimeout(() => {
      setSubmitted(true);
    }, 1000); // Simulate async booking process
  };
  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-green-600 font-semibold">
          Thank you for booking! We&#39;ll send you an email with the details.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
            />
          </div>
          <button type="submit" className="button-submit">
            Book Now
          </button>
        </form>
      )}
    </div>
  );
};
export default BookEvent;
