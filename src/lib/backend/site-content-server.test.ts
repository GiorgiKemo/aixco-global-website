import { describe, expect, it, vi } from "vitest";
import { siteContentDefaults } from "./site-content";
import { fetchSiteContentForServer } from "./site-content-server";
import type { Json } from "@/lib/supabase/database.types";

type QueryRow = { section: string; entry_key: string; payload: Json };

function createQueryClient(data: QueryRow[] | null, error: { message: string } | null = null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(async () => ({ data, error })),
  };

  return {
    client: {
      from: vi.fn(() => builder),
    },
    builder,
  };
}

describe("server site content backend", () => {
  it("fetches published site content with an injected Supabase server client", async () => {
    const { client, builder } = createQueryClient([
      {
        section: "company",
        entry_key: "profile",
        payload: {
          ...siteContentDefaults.company,
          email: "server-query@aixco.global",
        },
      },
    ]);

    const result = await fetchSiteContentForServer("en", { client });

    expect(result.ok).toBe(true);
    expect(result.source).toBe("supabase");
    expect(result.content.company.email).toBe("server-query@aixco.global");
    expect(client.from).toHaveBeenCalledWith("site_content_entries");
    expect(builder.select).toHaveBeenCalledWith("section, entry_key, payload");
    expect(builder.eq).toHaveBeenCalledWith("locale", "en");
    expect(builder.eq).toHaveBeenCalledWith("is_published", true);
    expect(builder.order).toHaveBeenCalledWith("sort_order", { ascending: true });
  });

  it("falls back to bundled content when the server query fails", async () => {
    const { client } = createQueryClient(null, { message: "network unavailable" });

    const result = await fetchSiteContentForServer("en", { client });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected fallback site content");
    expect(result.source).toBe("fallback");
    expect(result.content.company.email).toBe(siteContentDefaults.company.email);
    expect(result.reason).toBe("network unavailable");
  });
});
