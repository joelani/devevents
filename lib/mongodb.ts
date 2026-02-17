/**
 * lib/mongodb.ts
 *
 * Typed helper to connect to MongoDB using Mongoose.
 * - Caches the connection on the global object to avoid multiple
 *   connections during development/hot-reloads.
 * - Throws early if `MONGODB_URI` is not defined.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
}

declare global {
  // Store the connection and promise on the global object so that
  // during Next.js hot reloads we reuse the same connection instead
  // of creating new ones.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var __mongoose:
    | {
        conn: mongoose.Mongoose | null;
        promise: Promise<mongoose.Mongoose> | null;
      }
    | undefined;
}

// Initialize the global cache if it doesn't exist.
const cached =
  global.__mongoose ?? (global.__mongoose = { conn: null, promise: null });

/**
 * Connect to MongoDB using Mongoose and return the connected Mongoose instance.
 * Reuses an existing connection when available (cached.conn) or an in-flight
 * connection promise (cached.promise).
 */
export async function connectToDatabase(): Promise<mongoose.Mongoose> {
  // Return cached connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create one and store it.
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      // Disable mongoose buffering to fail fast when not connected.
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  // Await the in-flight connection promise and cache the resolved instance.
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
