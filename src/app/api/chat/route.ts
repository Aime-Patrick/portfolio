import { handleChatRequest } from "@/lib/server/chatHandler";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  return handleChatRequest(req);
}

export async function OPTIONS(req: Request) {
  return handleChatRequest(req);
}
