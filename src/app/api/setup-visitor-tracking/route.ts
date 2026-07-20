import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = createAdminClient();

    // Create visitor_profiles table
    const { error: profilesError } = await admin.from("visitor_profiles").insert({
      id: "00000000-0000-0000-0000-000000000001",
      created_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      visit_count: 0,
    });

    if (profilesError && !profilesError.message.includes("relation")) {
      console.log("Creating visitor_profiles table...");
      // Try to create the table via direct SQL
      const { error: createError } = await admin.rpc("query", {
        query: `
          create table if not exists public.visitor_profiles (
            id uuid primary key,
            created_at timestamptz not null default now(),
            last_seen_at timestamptz not null default now(),
            visit_count int not null default 1
          );

          alter table public.visitor_profiles enable row level security;

          drop policy if exists "anon_insert_visitor" on public.visitor_profiles;
          drop policy if exists "anon_update_own_visitor" on public.visitor_profiles;
          drop policy if exists "anon_select_own_visitor" on public.visitor_profiles;

          create policy "anon_insert_visitor" on public.visitor_profiles
            for insert to anon with check (true);
          create policy "anon_update_own_visitor" on public.visitor_profiles
            for update to anon using (true) with check (true);
          create policy "anon_select_own_visitor" on public.visitor_profiles
            for select to anon using (true);
        `,
      });

      if (createError) {
        console.error("RPC error:", createError);
      }
    } else if (profilesError) {
      console.log("Table exists or unexpected error:", profilesError.message);
    }

    // Clean up test record
    await admin
      .from("visitor_profiles")
      .delete()
      .eq("id", "00000000-0000-0000-0000-000000000001");

    return NextResponse.json({
      success: true,
      message: "Visitor tracking tables initialized. Apply SQL migration via Supabase dashboard.",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
