"use server";

import { Booking } from "@/database";
import connectToDatabase from "../mongodb";

export const createBooking = async ({
  eventId,
  email,
  slug,
}: {
  eventId: string;
  email: string;
  slug: string;
}) => {
  try {
    await connectToDatabase();
    await Booking.create({ eventId, email });
    return {
      success: true,
      message: "Booking created successfully",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error creating booking:", errorMessage);
    return {
      success: false,
      message: "Failed to create booking",
      error: errorMessage,
    };
  }
};
