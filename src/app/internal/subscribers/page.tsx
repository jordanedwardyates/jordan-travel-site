import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * INTERNAL subscriber list — shows every Dispatch signup (homepage form +
 * exit-intent/scroll popup), newest first. Token-gated outside development;
 * noindexed; reads via the service-role client to bypass the insert-only
 * RLS policy on public.subscribers.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal — Subscribers",
  robots: { index: false, follow: false },
};

type Subscriber = {
  id: string;
  created_at: string;
  email: string;
  source: string;
};

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const authorized =
    process.env.NODE_ENV === "development" || (!!token && key === token);
  if (!authorized) notFound();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("id, created_at, email, source")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const subscribers = (data ?? []) as Subscriber[];

  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-kicker uppercase text-compass-gold">
          Internal &middot; not public
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight">
          Dispatch subscribers
        </h1>
        <p className="mt-2 font-serif text-aegean-ink">
          {subscribers.length} total &middot; stored in Supabase
          (public.subscribers), synced to HubSpot by the twice-daily digest
          email.
        </p>

        <table className="mt-8 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-salt-air text-[0.6rem] uppercase tracking-[0.15em] text-aegean-ink">
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Source</th>
              <th className="py-2">Signed up</th>
            </tr>
          </thead>
          <tbody className="oldstyle-nums">
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-salt-air/50">
                <td className="py-2 pr-3">{s.email}</td>
                <td className="py-2 pr-3">{s.source}</td>
                <td className="py-2">
                  {new Date(s.created_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
