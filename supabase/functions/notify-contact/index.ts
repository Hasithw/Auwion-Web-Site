// Auwion — notify-contact Edge Function
//
// Triggered by a Supabase Database Webhook on INSERT into `contact_messages`
// (see /supabase/README-notify-contact.md for the full setup steps).
// Sends an email to you via Resend (https://resend.com) whenever someone
// submits the contact form, so you don't have to keep checking the
// Supabase dashboard for new rows.
//
// Required secrets (set with `supabase secrets set` or in the dashboard
// under Edge Functions -> notify-contact -> Secrets):
//   RESEND_API_KEY   — your Resend API key
//   NOTIFY_TO_EMAIL  — the inbox that should receive new-message alerts

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFY_TO_EMAIL = Deno.env.get("NOTIFY_TO_EMAIL")!;

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    // Supabase Database Webhooks send { type, table, record, old_record }
    const record = payload.record ?? {};

    const emailText = `New message from the Auwion contact form:

Name: ${record.full_name ?? "-"}
Email: ${record.email ?? "-"}
Company: ${record.company_name ?? "-"}
Interested in: ${record.interested_in ?? "-"}

Message:
${record.message ?? "-"}
`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // "onboarding@resend.dev" works immediately with no setup for
        // sending to your own inbox. Once you verify a domain in Resend,
        // swap this for something like "contact@auwion.com".
        from: "Auwion Contact Form <onboarding@resend.dev>",
        to: [NOTIFY_TO_EMAIL],
        subject: `New contact form message from ${record.full_name ?? "someone"}`,
        text: emailText,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ ok: false, error: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
