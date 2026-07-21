import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import {
  isChatScope,
  PUBLIC_SYSTEM_PROMPT,
  ADMIN_SYSTEM_PROMPT,
} from "./scopes";

const nvidia = createOpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

export type ChatRequestBody = {
  messages: UIMessage[];
  scope?: unknown;
};

export type ChatContext = {
  method: string;
  body: ChatRequestBody;
  authorization: string | null;
};

/** Plain text from the latest user turn (AI SDK UIMessage parts). */
function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg || msg.role !== "user") continue;
    const parts = Array.isArray(msg.parts) ? msg.parts : [];
    const text = parts
      .filter(
        (p): p is { type: "text"; text: string } =>
          !!p &&
          typeof p === "object" &&
          "type" in p &&
          (p as { type: string }).type === "text" &&
          "text" in p
      )
      .map((p) => p.text)
      .join(" ")
      .trim();
    if (text) return text;
    // Legacy content field fallback
    const legacy = msg as unknown as { content?: unknown };
    if (typeof legacy.content === "string") {
      return legacy.content.trim();
    }
  }
  return "";
}

/**
 * True when the user is only greeting / thanking — no portfolio lookup needed.
 * Keeps Llama from tool-spamming on "hi".
 */
function isChitchat(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[!?.]+$/g, "").trim();
  if (!t || t.length > 80) return false;
  return /^(hi|hii+|hello|hey|yo|sup|hola|howdy|good\s*(morning|afternoon|evening)|thanks|thank\s*you|ty|thx|ok|okay|cool|nice|great|bye|goodbye|see\s*ya)(\s+[a-z]+)?$/i.test(
    t
  );
}

export async function prepareChat(ctx: ChatContext) {
  if (ctx.method === "OPTIONS") {
    return { type: "options" as const };
  }

  if (ctx.method !== "POST") {
    return { type: "error" as const, status: 405, error: "Method not allowed" };
  }

  if (!process.env.NVIDIA_API_KEY) {
    return {
      type: "error" as const,
      status: 503,
      error: "NVIDIA_API_KEY is not configured on the server",
    };
  }

  const scope = isChatScope(ctx.body.scope) ? ctx.body.scope : "public";
  const messages = Array.isArray(ctx.body.messages) ? ctx.body.messages : [];

  if (scope === "admin") {
    try {
      // Lazy-load so public /api/chat does not pull firebase-admin → jwks-rsa → jose.
      const { verifyAdminToken } = await import("./firebaseAdmin");
      await verifyAdminToken(ctx.authorization);
    } catch (error) {
      return {
        type: "error" as const,
        status: 401,
        error: error instanceof Error ? error.message : "Unauthorized",
      };
    }
  }

  // Default to 8B — 70B on NIM often takes 45–90s+ with tool rounds.
  const modelId = process.env.NVIDIA_MODEL || "meta/llama-3.1-8b-instruct";
  const system = scope === "admin" ? ADMIN_SYSTEM_PROMPT : PUBLIC_SYSTEM_PROMPT;
  const userText = lastUserText(messages);
  const chitchat = isChitchat(userText);
  // Lazy-load tools (and transitively firebase-admin) only when a tool round is possible.
  const tools = chitchat
    ? undefined
    : (await import("./tools")).getToolsForScope(scope);
  // Keep recent turns only — long threads inflate prompt + latency.
  const recentMessages = messages.slice(-12);

  // Nudge small models toward the real SEO tool instead of inventing "Analytics".
  const wantsSeo =
    scope === "admin" &&
    /\b(seo|search\s*engine|meta\s*(title|desc|description)|serp|on-?page)\b/i.test(
      userText
    );

  const started = Date.now();
  const result = streamText({
    model: nvidia.chat(modelId),
    system: wantsSeo
      ? `${system}\n\nThis turn is about SEO. Call auditCmsSeo now, then rate with the returned score/grade/findings. Do not invent an Analytics tool.`
      : system,
    messages: await convertToModelMessages(recentMessages),
    // Cap length so replies finish sooner on shared NIM capacity.
    maxOutputTokens: 700,
    // Greetings: force text-only. Facts: one tool round, then answer.
    ...(chitchat
      ? { toolChoice: "none" as const }
      : wantsSeo
        ? {
            tools,
            toolChoice: { type: "tool" as const, toolName: "auditCmsSeo" },
            stopWhen: stepCountIs(2),
            prepareStep: ({ stepNumber }) => {
              if (stepNumber >= 1) {
                return { toolChoice: "none" as const };
              }
              return {};
            },
          }
        : {
            tools,
            toolChoice: "auto" as const,
            stopWhen: stepCountIs(2),
            prepareStep: ({ stepNumber }) => {
              if (stepNumber >= 1) {
                return { toolChoice: "none" as const };
              }
              return {};
            },
          }),
    maxRetries: 1,
    temperature: 0.4,
    onFinish: ({ steps }) => {
      console.info(
        `[chat] model=${modelId} scope=${scope} chitchat=${chitchat} seo=${wantsSeo} steps=${steps.length} ${Date.now() - started}ms`
      );
    },
  });

  return { type: "stream" as const, result };
}

export async function handleChatRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(req.headers.get("origin")),
    });
  }

  let body: ChatRequestBody = { messages: [] };
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return jsonError(400, "Invalid JSON body", req.headers.get("origin"));
  }

  const prepared = await prepareChat({
    method: req.method,
    body,
    authorization: req.headers.get("authorization"),
  });

  if (prepared.type === "options") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(req.headers.get("origin")),
    });
  }

  if (prepared.type === "error") {
    return jsonError(prepared.status, prepared.error, req.headers.get("origin"));
  }

  try {
    const response = prepared.result.toUIMessageStreamResponse();
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders(req.headers.get("origin"))).forEach(([k, v]) =>
      headers.set(k, v)
    );
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error("[chat]", error);
    return jsonError(
      500,
      error instanceof Error ? error.message : "Chat failed",
      req.headers.get("origin")
    );
  }
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function jsonError(status: number, error: string, origin: string | null) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
