import { createServerFn } from "@tanstack/react-start";
import { generateInsight, type InsightInput } from "./aiInsight.server";

export const generateInsightServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: InsightInput) => d)
  .handler(async ({ data }) => ({ insight: await generateInsight(data) }));
