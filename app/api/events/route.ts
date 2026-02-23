import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Slug helper
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Create a new event
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { message: "Content-Type must be multipart/form-data" },
        { status: 400 },
      );
    }

    const formData = await req.formData();

    // Normalize raw fields
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const overview = String(formData.get("overview") ?? "").trim();
    const venue = String(formData.get("venue") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const date = String(formData.get("date") ?? "").trim();
    const time = String(formData.get("time") ?? "").trim();
    const mode = String(formData.get("mode") ?? "").trim();
    const audience = String(formData.get("audience") ?? "").trim();
    const organizer = String(formData.get("organizer") ?? "").trim();
    const agendaRaw = String(formData.get("agenda") ?? "").trim();
    const tagsRaw = String(formData.get("tags") ?? "").trim();
    const file = formData.get("image") as File | null;

    // Validate required fields before uploading image
    const missing: string[] = [];
    if (!title) missing.push("title");
    if (!description) missing.push("description");
    if (!overview) missing.push("overview");
    if (!file) missing.push("image");
    if (!venue) missing.push("venue");
    if (!location) missing.push("location");
    if (!date) missing.push("date");
    if (!time) missing.push("time");
    if (!mode) missing.push("mode");
    if (!audience) missing.push("audience");
    if (!organizer) missing.push("organizer");
    if (!agendaRaw) missing.push("agenda");
    if (!tagsRaw) missing.push("tags");

    if (missing.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    // Convert arrays and ensure they are non-empty
    const agenda = agendaRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (agenda.length === 0 || tags.length === 0) {
      return NextResponse.json(
        { message: "`agenda` and `tags` must each contain at least one item" },
        { status: 400 },
      );
    }

    // Upload image to Cloudinary: support environments where `file.arrayBuffer` may not exist
    let arrayBuffer: ArrayBuffer;
    if (file && typeof (file as any).arrayBuffer === "function") {
      arrayBuffer = await (file as any).arrayBuffer();
    } else if (file) {
      arrayBuffer = await new Response(file as any).arrayBuffer();
    } else {
      return NextResponse.json(
        { message: "Image file is missing" },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(arrayBuffer);

    // Upload buffer using shared helper to centralize Cloudinary configuration
    const uploadResult = await uploadToCloudinary(buffer, slugify(title));

    // Build event object (normalize fields to plain strings/arrays)
    const eventData = {
      title,
      description,
      overview,
      venue,
      location,
      date,
      time,
      mode,
      audience,
      organizer,
      agenda,
      tags,
      image: uploadResult.url,
      slug: slugify(title),
    };

    const createdEvent = await Event.create(eventData);

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createdEvent,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating event:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Fetch all events
export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { message: "Error fetching events" },
      { status: 500 },
    );
  }
}

// a route that accepts a slug parameter and returns the corresponding event
// export async function GET(req: NextRequest) {
//   try {
//     await connectToDatabase();
//     const { searchParams } = new URL(req.url);
//     const slug = searchParams.get("slug");
//     if (!slug) {
//       return NextResponse.json(
//         { message: "Slug parameter is required" },
//         { status: 400 },
//       );
//     }
//     const event = await Event.findOne({ slug });
//     if (!event) {
//       return NextResponse.json({ message: "Event not found" }, { status: 404 });
//     }
//     return NextResponse.json(
//       { message: "Event fetched successfully", event },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Error fetching event:", error);
//     return NextResponse.json(
//       { message: "Error fetching event:", error: error },
//       { status: 500 },
//     );
//   }
// }
