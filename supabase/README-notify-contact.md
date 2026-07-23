# Email notifications for new contact form messages

This sets up an automatic email to you every time someone submits the
"Get in touch" form on about.html. Everything below is done through the
Supabase dashboard — no command line required.

IMPORTANT: do all of this in the CORRECT Supabase project — the one whose
URL matches `SUPABASE_URL` in `assets/supabase-client.js`
(`ecrokcjkcchxjvesqmtb`), not any other project in your account.

## 1. Create a free Resend account

1. Go to https://resend.com and sign up (no credit card required).
2. Once logged in, go to **API Keys** in the left sidebar.
3. Click **Create API Key**, give it any name (e.g. "auwion-contact-form"),
   and copy the key — it starts with `re_`. You won't be able to see it
   again, so paste it somewhere safe for now.

You do NOT need to verify a domain to get started — Resend lets you send
from `onboarding@resend.dev` to your own inbox right away. You can add a
verified `auwion.com` sender later if you want the "from" address to look
more official.

## 2. Create the Edge Function in Supabase

1. In your Supabase project, go to **Edge Functions** in the left sidebar.
2. Click **Create a new function**.
3. Name it exactly: `notify-contact`
4. Delete whatever placeholder code is shown, and paste in the full
   contents of `supabase/functions/notify-contact/index.ts` (the file
   next to this one).
5. Click **Deploy**.

## 3. Add the two secrets the function needs

1. Still in Edge Functions, click into `notify-contact`, then find the
   **Secrets** tab (or **Settings**, depending on the dashboard version).
2. Add:
   - `RESEND_API_KEY` = the `re_...` key you copied from Resend
   - `NOTIFY_TO_EMAIL` = the email address you want notifications sent to
     (e.g. your own inbox)
3. Save.

## 4. Create the Database Webhook

1. Go to **Database** -> **Webhooks** in the left sidebar.
2. Click **Create a new webhook**.
3. Fill in:
   - **Name**: `notify-contact-on-insert` (or anything descriptive)
   - **Table**: `contact_messages`
   - **Events**: check **Insert** only
   - **Type**: choose **Supabase Edge Functions** (not "HTTP Request") —
     this option handles authentication for you automatically
   - **Edge Function**: select `notify-contact` from the dropdown
4. Save / Create webhook.

## 5. Test it

1. Go to your live site's contact form and submit a test message.
2. Check the inbox you set as `NOTIFY_TO_EMAIL` (check spam too, just in
   case, especially on the first email).
3. If no email arrives, go to **Edge Functions -> notify-contact -> Logs**
   in Supabase to see the actual error returned by Resend or the function.

## Notes

- Free Resend accounts can send 100 emails/day and 3,000/month, which is
  far more than a contact form will generate.
- If you ever want to send from `contact@auwion.com` instead of
  `onboarding@resend.dev`, verify `auwion.com` under **Domains** in Resend,
  then change the `from` line in `notify-contact/index.ts` and redeploy.
