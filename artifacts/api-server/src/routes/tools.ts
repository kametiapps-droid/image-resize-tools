import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, toolsTable, toolUsageEventsTable } from "@workspace/db";
import {
  GetToolParams,
  RecordToolUseParams,
  RecordToolUseBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tools", async (req, res): Promise<void> => {
  const tools = await db.select().from(toolsTable).orderBy(toolsTable.name);
  res.json(tools);
});

router.get("/tools/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetToolParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tool] = await db
    .select()
    .from(toolsTable)
    .where(eq(toolsTable.id, params.data.id));

  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.json(tool);
});

router.post("/tools/:id/use", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RecordToolUseParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = RecordToolUseBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [tool] = await db
    .select()
    .from(toolsTable)
    .where(eq(toolsTable.id, params.data.id));

  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  await db.insert(toolUsageEventsTable).values({
    toolId: params.data.id,
    fileType: body.data.fileType ?? null,
    fileSizeKb: body.data.fileSizeKb ?? null,
  });

  const [updated] = await db
    .update(toolsTable)
    .set({ usageCount: tool.usageCount + 1 })
    .where(eq(toolsTable.id, params.data.id))
    .returning();

  res.json({ toolId: params.data.id, totalUses: updated.usageCount });
});

export default router;
