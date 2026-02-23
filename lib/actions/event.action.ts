"use server";

import { Event } from "@/database";
import connectToDatabase from "../mongodb";

export const getSimilarEvents = async (slug: string) => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug });

    // if (!event) {
    //   console.log(`Event not found for slug: ${slug}`);
    //   throw new Error(`Event not found for slug: ${slug}`);
    // }
    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch (error) {
    return [];
  }
};
