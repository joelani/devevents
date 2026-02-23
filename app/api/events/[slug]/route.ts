import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// Type definitions for route params and response
interface RouteParams {
  slug: string;
}

interface ErrorResponse {
  message: string;
  code?: string;
}

/**
 * GET /api/events/[slug]
 * Fetch a single event by its slug with full details
 *
 * @param request - Next.js request object
 * @param params - Dynamic route parameters containing slug
 * @returns Event details as JSON or appropriate error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    // Await and validate params (Next.js 15+ requires awaiting params)
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    // Validate slug parameter
    if (!slug || typeof slug !== "string") {
      return NextResponse.json<ErrorResponse>(
        {
          message: "Invalid or missing 'slug' parameter",
          code: "INVALID_SLUG",
        },
        { status: 400 },
      );
    }

    // Trim and validate slug is not empty after trimming
    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      return NextResponse.json<ErrorResponse>(
        {
          message: "Slug parameter cannot be empty",
          code: "EMPTY_SLUG",
        },
        { status: 400 },
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Query the event by slug
    const event = await Event.findOne({ slug: trimmedSlug }).lean().exec();

    // Event not found
    if (!event) {
      return NextResponse.json<ErrorResponse>(
        {
          message: `Event with slug "${trimmedSlug}" not found`,
          code: "EVENT_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    // Return event data with 200 OK
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    console.error("GET /api/events/[slug] error:", error);

    // Handle Mongoose/Database errors
    if (error instanceof Error) {
      // Invalid MongoDB ObjectId format or other validation errors
      if (error.name === "CastError" || error.message.includes("Cast to")) {
        return NextResponse.json<ErrorResponse>(
          {
            message: "Invalid slug format",
            code: "CAST_ERROR",
          },
          { status: 400 },
        );
      }

      // Generic database error message
      if (
        error.message.includes("connect") ||
        error.message.includes("database")
      ) {
        return NextResponse.json<ErrorResponse>(
          {
            message: "Database connection failed",
            code: "DB_CONNECTION_ERROR",
          },
          { status: 503 },
        );
      }
    }

    // Unexpected error
    return NextResponse.json<ErrorResponse>(
      {
        message: "An unexpected error occurred while fetching the event",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}
