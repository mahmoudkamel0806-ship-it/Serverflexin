import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

const STORE = "flexin-movies";

export default async (req: Request, _context: Context) => {
  const store = getStore(STORE);

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const items = blobs.map((b) => ({
      name: b.key,
      url: `/movies/${encodeURIComponent(b.key)}`,
    }));
    return Response.json(items);
  }

  if (req.method === "POST") {
    const form = await req.formData();
    const file = form.get("movie");
    if (!(file instanceof File)) {
      return Response.json({ message: "No file uploaded" }, { status: 400 });
    }
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const key = `${Date.now()}-${safeName}`;
    const buffer = await file.arrayBuffer();
    await store.set(key, buffer, {
      metadata: { contentType: file.type || "application/octet-stream" },
    });
    return Response.json({ message: "uploaded successfully", file: key });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/movies",
};
