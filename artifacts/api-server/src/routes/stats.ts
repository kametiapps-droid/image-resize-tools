import { Router, type IRouter } from "express";
import { desc, sql, sum } from "drizzle-orm";
import { db, toolsTable, toolUsageEventsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const [totals] = await db
    .select({ totalProcessed: sum(toolsTable.usageCount) })
    .from(toolsTable);

  const [toolCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolsTable);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [todayCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolUsageEventsTable)
    .where(sql`${toolUsageEventsTable.createdAt} >= ${oneDayAgo}`);

  const [topCategory] = await db
    .select({
      category: toolsTable.category,
      total: sum(toolsTable.usageCount),
    })
    .from(toolsTable)
    .groupBy(toolsTable.category)
    .orderBy(desc(sum(toolsTable.usageCount)))
    .limit(1);

  res.json({
    totalProcessed: Number(totals?.totalProcessed ?? 0),
    totalTools: toolCount?.count ?? 0,
    uniqueUsersToday: todayCount?.count ?? 0,
    topCategoryName: topCategory?.category ?? null,
  });
});

router.get("/stats/recent", async (req, res): Promise<void> => {
  const events = await db
    .select({
      toolId: toolUsageEventsTable.toolId,
      toolName: toolsTable.name,
      timestamp: toolUsageEventsTable.createdAt,
      fileType: toolUsageEventsTable.fileType,
    })
    .from(toolUsageEventsTable)
    .innerJoin(toolsTable, sql`${toolUsageEventsTable.toolId} = ${toolsTable.id}`)
    .orderBy(desc(toolUsageEventsTable.createdAt))
    .limit(20);

  res.json(
    events.map((e) => ({
      toolId: e.toolId,
      toolName: e.toolName,
      timestamp: e.timestamp.toISOString(),
      fileType: e.fileType ?? null,
    }))
  );
});

router.get("/stats/popular", async (req, res): Promise<void> => {
  const tools = await db
    .select({
      toolId: toolsTable.id,
      toolName: toolsTable.name,
      usageCount: toolsTable.usageCount,
    })
    .from(toolsTable)
    .orderBy(desc(toolsTable.usageCount))
    .limit(10);

  const total = tools.reduce((acc, t) => acc + t.usageCount, 0) || 1;

  res.json(
    tools.map((t) => ({
      toolId: t.toolId,
      toolName: t.toolName,
      usageCount: t.usageCount,
      percentage: Math.round((t.usageCount / total) * 100 * 10) / 10,
    }))
  );
});

export default router;
