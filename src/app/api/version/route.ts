import { NextResponse } from "next/server";

// Read version from package.json at build time
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require("../../../../package.json") as { version: string };

export async function GET() {
  return NextResponse.json({
    version,
    minVersion: "0.1.0",
    forceUpdate: false,
  });
}
