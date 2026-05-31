import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { createClient } from "@supabase/supabase-js";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
};

const app = new Hono<{ Bindings: Env }>().basePath("/api");

function sb(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

function mapTool(t: Record<string, unknown>) {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    category: t.category,
    icon: t.icon ?? null,
    usageCount: t.usage_count,
    featured: t.featured,
    createdAt: t.created_at,
  };
}

// Health
app.get("/healthz", (c) => c.json({ status: "ok" }));

// List tools
app.get("/tools", async (c) => {
  const { data, error } = await sb(c.env).from("tools").select("*").order("name");
  if (error) return c.json({ error: error.message }, 500);
  return c.json((data ?? []).map(mapTool));
});

// Get single tool
app.get("/tools/:id", async (c) => {
  const id = c.req.param("id");
  const { data, error } = await sb(c.env).from("tools").select("*").eq("id", id).single();
  if (error || !data) return c.json({ error: "Tool not found" }, 404);
  return c.json(mapTool(data as Record<string, unknown>));
});

// Record tool use
app.post("/tools/:id/use", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ fileType?: string; fileSizeKb?: number }>().catch(() => ({}));
  const client = sb(c.env);

  const { data: tool, error: toolErr } = await client.from("tools").select("usage_count").eq("id", id).single();
  if (toolErr || !tool) return c.json({ error: "Tool not found" }, 404);

  await client.from("tool_usage_events").insert({
    tool_id: id,
    file_type: body.fileType ?? null,
    file_size_kb: body.fileSizeKb ?? null,
  });

  const newCount = ((tool as Record<string, unknown>).usage_count as number) + 1;
  await client.from("tools").update({ usage_count: newCount }).eq("id", id);

  return c.json({ toolId: id, totalUses: newCount });
});

// Stats
app.get("/stats", async (c) => {
  const client = sb(c.env);
  const { data: tools } = await client.from("tools").select("usage_count, category");
  const rows = (tools ?? []) as Array<{ usage_count: number; category: string }>;
  const totalProcessed = rows.reduce((a, t) => a + (t.usage_count || 0), 0);
  const totalTools = rows.length;

  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
  const { count: todayCount } = await client
    .from("tool_usage_events")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneDayAgo);

  const catMap: Record<string, number> = {};
  for (const t of rows) catMap[t.category] = (catMap[t.category] || 0) + (t.usage_count || 0);
  const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return c.json({ totalProcessed, totalTools, uniqueUsersToday: todayCount ?? 0, topCategoryName: topCategory });
});

// Recent activity
app.get("/stats/recent", async (c) => {
  const { data, error } = await sb(c.env)
    .from("tool_usage_events")
    .select("tool_id, file_type, created_at, tools(name)")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(
    (data ?? []).map((e: Record<string, unknown>) => ({
      toolId: e.tool_id,
      toolName: (e.tools as Record<string, unknown> | null)?.name ?? null,
      timestamp: e.created_at,
      fileType: e.file_type ?? null,
    }))
  );
});

// Popular tools
app.get("/stats/popular", async (c) => {
  const { data, error } = await sb(c.env)
    .from("tools")
    .select("id, name, usage_count")
    .order("usage_count", { ascending: false })
    .limit(10);
  if (error) return c.json({ error: error.message }, 500);
  const rows = (data ?? []) as Array<{ id: string; name: string; usage_count: number }>;
  const total = rows.reduce((a, t) => a + (t.usage_count || 0), 0) || 1;
  return c.json(
    rows.map((t) => ({
      toolId: t.id,
      toolName: t.name,
      usageCount: t.usage_count,
      percentage: Math.round((t.usage_count / total) * 1000) / 10,
    }))
  );
});

export const onRequest = handle(app);
