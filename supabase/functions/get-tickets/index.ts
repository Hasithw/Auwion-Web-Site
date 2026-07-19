// Auwion — get-tickets Edge Function (stub)
//
// Runs on Supabase's servers, not in the browser, so the Odoo API
// credentials below are never exposed to a client. Deploy with:
//
//   supabase functions deploy get-tickets
//   supabase secrets set ODOO_URL=... ODOO_DB=... ODOO_API_KEY=...
//
// This is a starting point, not a finished integration — the actual Odoo
// Helpdesk API calls (likely JSON-RPC against /jsonrpc, or the Odoo REST
// module if installed) still need to be filled in and tested against a
// real Odoo instance.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ODOO_URL = Deno.env.get("ODOO_URL")!;
const ODOO_DB = Deno.env.get("ODOO_DB")!;
const ODOO_API_KEY = Deno.env.get("ODOO_API_KEY")!;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  // 1. Verify the logged-in user from their auth token
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Missing auth", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return new Response("Not authenticated", { status: 401 });
  }

  // 2. Look up which Odoo client record this user is linked to
  const { data: profile } = await supabase
    .from("profiles")
    .select("odoo_client_id, match_status")
    .eq("id", userData.user.id)
    .single();

  if (!profile || profile.match_status !== "matched" || !profile.odoo_client_id) {
    // Account exists but isn't linked to an Odoo record yet —
    // this is the "couldn't automatically match your account" case.
    return new Response(JSON.stringify({ tickets: [], status: "unmatched" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Fetch tickets from Odoo Helpdesk for that client, filtered to
  //    read-only fields (no self-serve ticket creation per current scope).
  //    TODO: replace with a real call against your Odoo instance.
  //
  //    const odooRes = await fetch(`${ODOO_URL}/jsonrpc`, {
  //      method: "POST",
  //      headers: { "Content-Type": "application/json" },
  //      body: JSON.stringify({
  //        jsonrpc: "2.0",
  //        method: "call",
  //        params: {
  //          service: "object",
  //          method: "execute_kw",
  //          args: [
  //            ODOO_DB, /* uid */ 1, ODOO_API_KEY,
  //            "helpdesk.ticket", "search_read",
  //            [[["partner_id", "=", profile.odoo_client_id]]],
  //            { fields: ["name", "stage_id", "write_date"] },
  //          ],
  //        },
  //      }),
  //    });

  const placeholderTickets = [
    { name: "Invoice sync error", platform: "Business Central", status: "In progress", updated: "2h ago" },
    { name: "Add new user role", platform: "Odoo", status: "Open", updated: "1d ago" },
    { name: "Monthly reconciliation", platform: "Book keeping", status: "Resolved", updated: "4d ago" },
  ];

  return new Response(JSON.stringify({ tickets: placeholderTickets, status: "matched" }), {
    headers: { "Content-Type": "application/json" },
  });
});
