import { Firecrawl } from "firecrawl";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { ProjectImportDraft } from "@/lib/projectImport";

export type { ProjectImportDraft };

const projectDraftSchema = z.object({
  title: z.string().describe("Short project name, max ~60 characters"),
  subtitle: z
    .string()
    .describe("Category or one-line positioning, max ~50 characters"),
  description: z
    .string()
    .describe("2–3 sentence portfolio blurb, concrete and professional"),
  githubUrl: z
    .string()
    .optional()
    .describe("GitHub repo URL if clearly present, else omit"),
});

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("URL is required");
  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error("Enter a valid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http(s) URLs are supported");
  }
  return parsed.toString();
}

function pickGithubLink(links: string[] | undefined, markdown: string): string {
  const fromLinks =
    links?.find((l) => /github\.com\/[^/]+\/[^/]+/i.test(l)) || "";
  if (fromLinks) return fromLinks.split(/[?#]/)[0]!;
  const match = markdown.match(
    /https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/
  );
  return match?.[0] || "";
}

function truncate(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

async function polishWithAi(input: {
  url: string;
  markdown: string;
  metaTitle?: string;
  metaDescription?: string;
}): Promise<z.infer<typeof projectDraftSchema> | null> {
  if (!process.env.NVIDIA_API_KEY) return null;

  const nvidia = createOpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: process.env.NVIDIA_API_KEY,
  });
  const modelId = process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct";
  const content = input.markdown.slice(0, 12000);

  try {
    const { object } = await generateObject({
      model: nvidia.chat(modelId),
      schema: projectDraftSchema,
      prompt: `You write portfolio project cards for a software engineer.

Website URL: ${input.url}
OG title: ${input.metaTitle || "(none)"}
OG description: ${input.metaDescription || "(none)"}

Page content (markdown):
${content}

Return JSON fields for a polished portfolio entry.
- title: product/site name, not a slogan
- subtitle: category like "SaaS platform" or "School management system"
- description: 2–3 sentences, what it does and for whom; no fluff
- githubUrl: only if a real GitHub repo URL appears in the content`,
    });
    return object;
  } catch (error) {
    console.error("[importProject] AI polish failed:", error);
    return null;
  }
}

export async function importProjectFromUrl(
  rawUrl: string
): Promise<ProjectImportDraft> {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error(
      "FIRECRAWL_API_KEY is not configured. Add it to .env.local and restart the server."
    );
  }

  const url = normalizeUrl(rawUrl);
  const client = new Firecrawl({
    apiKey: process.env.FIRECRAWL_API_KEY,
    ...(process.env.FIRECRAWL_API_URL
      ? { apiUrl: process.env.FIRECRAWL_API_URL }
      : {}),
  });

  const doc = await client.scrape(url, {
    formats: [
      "markdown",
      "links",
      {
        type: "screenshot",
        fullPage: false,
        quality: 80,
        viewport: { width: 1280, height: 720 },
      },
    ],
    onlyMainContent: true,
    timeout: 60000,
    blockAds: true,
  });

  const markdown = doc.markdown?.trim() || "";
  const meta = doc.metadata ?? {};
  const metaTitle =
    (typeof meta.title === "string" && meta.title) ||
    (typeof meta.ogTitle === "string" && meta.ogTitle) ||
    "";
  const metaDescription =
    (typeof meta.description === "string" && meta.description) ||
    (typeof meta.ogDescription === "string" && meta.ogDescription) ||
    "";
  const metaImage =
    (typeof meta.ogImage === "string" && meta.ogImage) ||
    (typeof meta.image === "string" && meta.image) ||
    "";

  const screenshot =
    typeof doc.screenshot === "string" && doc.screenshot
      ? doc.screenshot
      : "";

  if (!markdown && !metaTitle && !screenshot && !metaImage) {
    throw new Error(
      "Could not extract content from that URL. Try another page or enter details manually."
    );
  }

  const polished = await polishWithAi({
    url,
    markdown: markdown || `${metaTitle}\n\n${metaDescription}`,
    metaTitle,
    metaDescription,
  });

  const title = truncate(
    polished?.title || metaTitle || new URL(url).hostname,
    80
  );
  const subtitle = truncate(polished?.subtitle || "Web project", 60);
  const description = truncate(
    polished?.description ||
      metaDescription ||
      "Imported from the live site. Edit this description to match your portfolio voice.",
    420
  );

  const githubUrl =
    polished?.githubUrl ||
    pickGithubLink(
      Array.isArray(doc.links) ? doc.links : undefined,
      markdown
    );

  const links: { url: string; label: string }[] = [
    { url: githubUrl, label: "GitHub" },
    { url, label: "Live" },
  ];

  return {
    url,
    title,
    subtitle,
    description,
    image: screenshot || metaImage,
    links,
    source: {
      scraped: Boolean(markdown || metaTitle),
      aiPolished: Boolean(polished),
      hasScreenshot: Boolean(screenshot),
    },
  };
}
