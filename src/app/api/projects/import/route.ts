import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/server/firebaseAdmin";
import { importProjectFromUrl } from "@/lib/server/importProject";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    await verifyAdminToken(req.headers.get("authorization"));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unauthorized",
      },
      { status: 401 }
    );
  }

  let body: { url?: string } = {};
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.url?.trim()) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const draft = await importProjectFromUrl(body.url);
    return NextResponse.json(draft);
  } catch (error) {
    console.error("[api/projects/import]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to import project from URL";
    const status = message.includes("FIRECRAWL_API_KEY") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
