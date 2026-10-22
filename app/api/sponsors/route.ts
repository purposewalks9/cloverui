import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

import { SPONSORS_TAG } from "@/lib/sponsors";

function verified(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.GITHUB_SPONSORS_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 501 });

  const body = await request.text();
  if (!verified(body, request.headers.get("x-hub-signature-256"), secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = request.headers.get("x-github-event");
  if (event === "sponsorship") revalidateTag(SPONSORS_TAG, "max");

  return Response.json({ ok: true, event });
}
