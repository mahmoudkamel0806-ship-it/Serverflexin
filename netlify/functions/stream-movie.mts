import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

const STORE = "flexin-movies";

export default async (req: Request, context: Context) => {
  const key = decodeURIComponent(context.params["filename"] ?? "");
  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  const store = getStore(STORE);
  const result = await store.getWithMetadata(key, { type: "stream" });
  if (!result) {
    return new Response("Not found", { status: 404 });
  }

  const contentType =
    (result.metadata?.contentType as string) || "application/octet-stream";

  return new Response(result.data as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
};

export const config: Config = {
  path: "/movies/:filename",
};
