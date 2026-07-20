import { Firecrawl } from "firecrawl";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { ProfileImportDraft } from "@/lib/profileImport";

export type { ProfileImportDraft };

const profileDraftSchema = z.object({
  name: z.string().describe("Full name"),
  title: z
    .string()
    .describe(
      "Professional title, e.g. Software Engineer or Full-Stack Developer"
    ),
  bio: z
    .string()
    .describe(
      "2–4 sentence first-person or third-person portfolio bio covering web/SaaS, AI agents in existing systems, SEO when relevant — concrete, no fluff"
    ),
  email: z.string().optional().describe("Email if present"),
  phone: z.string().optional().describe("Phone if present"),
  location: z.string().optional().describe("City/country if present"),
  skills: z
    .array(z.string())
    .describe("Key technical and product skills, max 20"),
  experienceYears: z
    .string()
    .describe("Years of experience like 3+, 5+, or estimate from career span"),
  experienceDescription: z
    .string()
    .describe("Short summary of professional experience for the portfolio"),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string().describe("Graduation year or range"),
      })
    )
    .describe("Education entries, most recent first"),
  socialLinks: z
    .array(
      z.object({
        platform: z
          .string()
          .describe("lowercase platform key: github, linkedin, twitter, etc."),
        url: z.string(),
      })
    )
    .describe("Social / portfolio links found on the resume"),
});

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;

export function assertResumeFile(file: {
  name: string;
  type: string;
  size: number;
}) {
  if (!file.name || !ALLOWED_EXT.test(file.name)) {
    throw new Error("Upload a PDF or Word resume (.pdf, .doc, .docx)");
  }
  if (file.type && !ALLOWED_TYPES.has(file.type) && file.type !== "application/octet-stream") {
    // Some browsers send empty/octet-stream for docs — extension check above is enough
    if (!ALLOWED_EXT.test(file.name)) {
      throw new Error("Unsupported file type. Use PDF or Word.");
    }
  }
  const max = 12 * 1024 * 1024;
  if (file.size > max) {
    throw new Error("Resume must be under 12 MB");
  }
}

async function polishProfileFromMarkdown(
  markdown: string,
  filename: string
): Promise<z.infer<typeof profileDraftSchema> | null> {
  if (!process.env.NVIDIA_API_KEY) return null;

  const nvidia = createOpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: process.env.NVIDIA_API_KEY,
  });
  const modelId = process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct";
  const content = markdown.slice(0, 16000);

  try {
    const { object } = await generateObject({
      model: nvidia.chat(modelId),
      schema: profileDraftSchema,
      prompt: `Extract a portfolio profile from this resume/CV (${filename}).

Rules:
- Prefer facts from the document; do not invent employers or degrees.
- title: strongest current role / specialty.
- bio: polished portfolio blurb highlighting web apps, SaaS, AI agents integrated into existing systems, SEO optimization, and reliable delivery when supported by the resume.
- skills: unique, useful tech/product skills (dedupe, max 20).
- experienceYears: concise like "4+" from timeline if possible.
- education: at least one entry if any education exists; otherwise empty array.
- socialLinks: only real URLs from the resume; platform lowercase (github, linkedin, twitter, website).

Resume markdown:
${content}`,
    });
    return object;
  } catch (error) {
    console.error("[importResume] AI polish failed:", error);
    return null;
  }
}

function fallbackFromMarkdown(markdown: string): z.infer<typeof profileDraftSchema> {
  const email =
    markdown.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone =
    markdown.match(
      /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}/
    )?.[0] || "";
  const lines = markdown
    .split("\n")
    .map((l) => l.replace(/^#+\s*/, "").trim())
    .filter(Boolean);
  const name = lines[0]?.slice(0, 80) || "Your Name";

  return {
    name,
    title: "Software Engineer",
    bio: "Software engineer building web apps, SaaS products, and AI-assisted workflows. Edit this bio after import.",
    email,
    phone,
    location: "",
    skills: [],
    experienceYears: "",
    experienceDescription: "",
    education: [],
    socialLinks: [],
  };
}

export async function importProfileFromResume(input: {
  buffer: Buffer;
  filename: string;
  contentType?: string;
}): Promise<ProfileImportDraft> {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error(
      "FIRECRAWL_API_KEY is not configured. Add it to .env.local and restart the server."
    );
  }

  assertResumeFile({
    name: input.filename,
    type: input.contentType || "",
    size: input.buffer.length,
  });

  const client = new Firecrawl({
    apiKey: process.env.FIRECRAWL_API_KEY,
    ...(process.env.FIRECRAWL_API_URL
      ? { apiUrl: process.env.FIRECRAWL_API_URL }
      : {}),
  });

  const doc = await client.parse(
    {
      data: input.buffer,
      filename: input.filename,
      contentType: input.contentType,
    },
    {
      formats: ["markdown"],
      parsers: [{ type: "pdf", mode: "auto", maxPages: 8 }],
      onlyMainContent: true,
      timeout: 90000,
    }
  );

  const markdown = doc.markdown?.trim() || "";
  if (!markdown || markdown.length < 40) {
    throw new Error(
      "Could not read enough text from that resume. Try a text-based PDF."
    );
  }

  const polished = await polishProfileFromMarkdown(markdown, input.filename);
  const data = polished || fallbackFromMarkdown(markdown);

  const education =
    data.education?.length > 0
      ? data.education.map((e) => ({
          degree: e.degree || "",
          institution: e.institution || "",
          year: e.year || "",
        }))
      : [{ degree: "", institution: "", year: "" }];

  const socialLinks =
    data.socialLinks?.filter((l) => l.url?.trim()).length > 0
      ? data.socialLinks
          .filter((l) => l.url?.trim())
          .map((l) => ({
            platform: (l.platform || "website").toLowerCase(),
            url: l.url.trim(),
          }))
      : [
          { platform: "github", url: "" },
          { platform: "linkedin", url: "" },
          { platform: "twitter", url: "" },
        ];

  return {
    name: data.name?.trim() || "",
    title: data.title?.trim() || "",
    bio: data.bio?.trim() || "",
    email: data.email?.trim() || "",
    phone: data.phone?.trim() || "",
    location: data.location?.trim() || "",
    skills: (data.skills || []).map((s) => s.trim()).filter(Boolean).slice(0, 20),
    experience: {
      years: data.experienceYears?.trim() || "",
      description: data.experienceDescription?.trim() || "",
    },
    education,
    socialLinks,
    source: {
      parsed: true,
      aiPolished: Boolean(polished),
      filename: input.filename,
    },
  };
}
