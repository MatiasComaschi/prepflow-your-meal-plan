import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getOrGenerateImage } from "@/server/images.server";

/**
 * Background maintenance hook (called by pg_cron weekly):
 * 1. Pre-generate images for the top 5 most-hit recipes that lack an image_url.
 * 2. Delete low-confidence recipes (<50) older than 7 days so they get
 *    re-fetched + re-reviewed by the AI on next request.
 */
export const Route = createFileRoute("/api/public/hooks/recipe-maintenance")({
  server: {
    handlers: {
      POST: async () => {
        const results = { pregenerated: 0, purged: 0, errors: [] as string[] };

        // ── 1. Pre-generate images for top-5 popular recipes missing images ──
        const { data: top, error: topErr } = await supabaseAdmin
          .from("cached_recipes")
          .select("id, name, image_url")
          .order("hits", { ascending: false })
          .limit(20);

        if (topErr) {
          results.errors.push(`top query: ${topErr.message}`);
        } else if (top) {
          const needsImage = top.filter((r) => !r.image_url).slice(0, 5);
          for (const r of needsImage) {
            try {
              const url = await getOrGenerateImage(r.id, r.name);
              if (url) {
                await supabaseAdmin
                  .from("cached_recipes")
                  .update({ image_url: url })
                  .eq("id", r.id);
                results.pregenerated++;
              }
            } catch (e: any) {
              results.errors.push(`pregen ${r.id}: ${e?.message ?? e}`);
            }
          }
        }

        // ── 2. Purge low-confidence recipes older than 7 days ──
        const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: purged, error: purgeErr } = await supabaseAdmin
          .from("cached_recipes")
          .delete()
          .lt("confidence", 50)
          .lt("updated_at", cutoff)
          .select("id");

        if (purgeErr) {
          results.errors.push(`purge: ${purgeErr.message}`);
        } else {
          results.purged = purged?.length ?? 0;
        }

        return Response.json({ success: true, ...results });
      },
    },
  },
});
