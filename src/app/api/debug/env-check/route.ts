import { NextResponse } from "next/server";

function decodeJwtRef(jwt: string | undefined): string {
  if (!jwt) return "MISSING";
  const parts = jwt.split(".");
  if (parts.length !== 3) return "NOT_A_JWT";
  try {
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    const parsed = JSON.parse(payload) as { ref?: string; role?: string };
    return `ref=${parsed.ref ?? "?"} role=${parsed.role ?? "?"}`;
  } catch {
    return "DECODE_ERROR";
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    supabase_url: url ?? "MISSING",
    anon_key: decodeJwtRef(anon),
    service_key: decodeJwtRef(service),
  });
}
