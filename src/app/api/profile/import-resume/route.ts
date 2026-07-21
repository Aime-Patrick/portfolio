import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/server/firebaseAdmin";
import {
  assertResumeFile,
  importProfileFromResume,
} from "@/lib/server/importResume";

export const runtime = "nodejs";
// Vercel Hobby plan caps serverless function duration at 60s
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    await verifyAdminToken(req.headers.get("authorization"));
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unauthorized",
      },
      { status: 401 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data with a resume file" },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Attach a resume file under the \"file\" field" },
      { status: 400 }
    );
  }

  try {
    assertResumeFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const draft = await importProfileFromResume({
      buffer,
      filename: file.name,
      contentType: file.type || undefined,
    });

    return NextResponse.json(draft);
  } catch (error) {
    console.error("[api/profile/import-resume]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to import profile from resume";
    const status = message.includes("FIRECRAWL_API_KEY")
      ? 503
      : message.includes("Upload") || message.includes("under")
        ? 400
        : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
