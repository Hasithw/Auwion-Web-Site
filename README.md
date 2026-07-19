# Auwion website — hosting setup

This site is static HTML/CSS/JS (GitHub Pages) with Supabase handling auth
and data for the client portal. Nothing here is live yet — follow the steps
below to actually deploy it.

## 1. Put this on GitHub

```bash
cd auwion-site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Create the empty repo on GitHub first, at github.com/new — don't
initialize it with a README there, to avoid a merge conflict.)

## 2. Turn on GitHub Pages

1. On GitHub: repo → **Settings** → **Pages**
2. Under "Build and deployment", set **Source** to "Deploy from a branch"
3. Branch: `main`, folder: `/ (root)` → **Save**
4. GitHub will give you a URL like `https://<username>.github.io/<repo>/`
   within a minute or two

## 3. Custom domain (optional, once ready)

1. Still in Settings → Pages, enter your domain (e.g. `www.auwion.com`)
   under "Custom domain"
2. At your domain registrar, add a `CNAME` record pointing
   `www` → `<username>.github.io`
3. Check "Enforce HTTPS" once the certificate provisions (can take a
   few hours)

## 4. Set up Supabase (for login, signup, and the client portal)

1. Create a project at [supabase.com](https://supabase.com)
2. **Project Settings → API** — copy your Project URL and anon public key
3. Paste both into `assets/supabase-client.js` (replace the two placeholder
   values at the top)
4. **Authentication → Providers** — confirm Email is enabled
5. **SQL Editor** — run everything in `supabase/schema.sql` to create the
   `profiles` table that links a signed-up user to their Odoo client record
6. Add this line before `</body>` in `login.html` and `signup.html` (it's
   not there yet — the pages are still static):
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="assets/supabase-client.js"></script>
   ```
   and wire the forms' submit handlers to call `auwionSignUp(...)` /
   `auwionLogIn(...)` from that file.

## 5. Connect the client portal to Odoo Helpdesk

The browser should never talk to Odoo directly (it would expose Odoo
credentials to anyone using dev tools). Instead:

1. Deploy the Edge Function in `supabase/functions/get-tickets`:
   ```bash
   supabase functions deploy get-tickets
   supabase secrets set ODOO_URL=https://your-odoo-instance.com \
     ODOO_DB=your_db_name \
     ODOO_API_KEY=your_api_key
   ```
2. Fill in the actual Odoo API call inside `index.ts` (currently a
   commented-out placeholder) — the exact call depends on whether you're
   using Odoo's JSON-RPC API or a REST module
3. Update `portal.html` to call `auwionGetTickets()` from
   `assets/supabase-client.js` and render the result instead of the
   hard-coded table rows currently there

## What's still a placeholder / not wired up

- Contact form on `about.html` doesn't send anywhere yet (needs a form
  backend, e.g. a Supabase Edge Function that emails you, or a service
  like Formspree)
- Account-matching (new signup → correct Odoo client) is a manual/
  semi-automated process for now — see the note in `supabase/schema.sql`
- Two of the three article previews are placeholder content
