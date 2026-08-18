# Ulfah — instructions

Use this file to set up, run, and operate the app. Keep it in this folder.

**Ulfah** is a private, invite-only Muslim marriage matching app for people who **currently live in Australia**. It is a mobile-friendly website (PWA), not a dating app. There is no in-app chat. Phone, email, and wali details stay hidden until **both people express interest** and a **matchmaker releases** the match.

---

## 1. What you need

- Node.js 20 or newer (`node -v`)
- npm (`npm -v`)
- A Postgres database (pick one):
  - **Neon** (recommended with Vercel) — [neon.tech](https://neon.tech)
  - **Docker Desktop** + `docker compose up -d` in this folder
  - Any other Postgres 16 URL
- A GitHub account (you already have this)
- A Vercel account for hosting (you already have this)
- Later, for real SMS/email:
  - Twilio (you already have this) for Australian mobiles
  - Resend (or similar) for email

Optional locally: if Twilio and Resend keys are empty, codes and email links print in the **terminal**. That is enough to test.

---

## 2. One-time setup (this computer)

Open a terminal in this folder:

```bash
cd "/Users/aabumarzouq/Muslim dating app"
```

### 2.1 Install packages

```bash
npm install
```

### 2.2 Create environment file

```bash
cp .env.example .env.local
```

Edit `.env.local`. Do not commit this file.

Generate two secrets:

```bash
openssl rand -base64 32
openssl rand -base64 32
```

Paste one into `BETTER_AUTH_SECRET` and the other into `CONTACT_ENCRYPTION_KEY`.

| Variable | Required | What it does |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string |
| `BETTER_AUTH_SECRET` | Yes | Signs login sessions |
| `BETTER_AUTH_URL` | Yes | Public origin, e.g. `http://localhost:3000` |
| `CONTACT_ENCRYPTION_KEY` | Yes | Encrypts wali phone/email at rest |
| `TWILIO_ACCOUNT_SID` | Prod | SMS OTP + match-release texts |
| `TWILIO_AUTH_TOKEN` | Prod | Twilio auth |
| `TWILIO_FROM_NUMBER` | Prod | Twilio sender number |
| `RESEND_API_KEY` | Prod | Verification and match emails |
| `EMAIL_FROM` | Prod | From address Resend has verified |

**Local Docker example**

```
DATABASE_URL=postgres://mawadda:mawadda@localhost:5432/mawadda
BETTER_AUTH_URL=http://localhost:3000
```

**Neon example**

```
DATABASE_URL=postgres://USER:PASSWORD@HOST/neondb?sslmode=require
BETTER_AUTH_URL=http://localhost:3000
```

### 2.3 Start the database

**Option A — Neon**

1. Create a project in Neon.
2. Copy the connection string into `DATABASE_URL`.
3. Skip Docker.

**Option B — Docker**

```bash
docker compose up -d
```

This starts Postgres 16 on port `5432` with user/password/database `mawadda`.

### 2.4 Create tables

```bash
npm run db:push
```

This reads `DATABASE_URL` from `.env.local`. You should see Drizzle apply the schema with no errors.

If you see `url: ''`, `.env.local` is missing `DATABASE_URL`. If you see `ECONNREFUSED` or `connect`, Postgres is not running — use Neon or Docker (section 2.3).

### 2.5 Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 3. First launch (owner)

`/setup` works **only while there is no owner yet**. After that it redirects to login.

1. Open [http://localhost:3000/setup](http://localhost:3000/setup).
2. Enter your first name, email, and a strong password (10+ characters, letter + number).
3. You land in **Admin → Matchmaker desk**.

If setup fails, check the terminal for database errors.

### Create the first invites

1. Go to **Admin → Invites**.
2. Create a code (optional: lock it to one email).
3. Share the code, or send this link:

```
http://localhost:3000/register?invite=YOURCODE
```

On production, replace the host with your domain.

---

## 4. Member path (what testers do)

1. Open `/register` with a valid invite.
2. Confirm: live in Australia, seeking marriage, 18+.
3. Choose brother or sister. Gender cannot be changed later.
4. Verify **email** (link in inbox, or in the terminal in local mode).
5. Verify **Australian mobile** (`04xxxxxxxx`). Local mode: the 6-digit code is in the terminal.
6. Complete the profile.
   - Sisters **must** add wali name, mobile, and email.
   - Photos are optional (up to 3) and stay hidden until a mutual match.
7. Wait. The profile is **not public** until admin approves it.
8. After approval: browse, filter, open a profile, tap **Express interest**.
9. The other person does **not** see the like until they like back.
10. When it is mutual, wait for admin. Then open **Matches** for phone, email, and wali details.

Rules baked in:

- Max **10** active interests.
- Withdraw is allowed **until** it becomes mutual.
- After admin releases a match, **both profiles leave the public pool**.
- No chat.

---

## 5. Admin path (what you and matchmakers do)

Sign in, then open `/admin`.

| Page | Use it for |
|---|---|
| Desk | Counts: profiles waiting, matches waiting, reports, invites |
| Profiles | Approve, send back for edits, reopen after a match, or ban |
| Matches | Release contact to both people, or decline |
| Invites | Create / revoke codes |
| Reports | Review member reports |
| Team | **Owner only.** Promote an existing member email to matchmaker |

**Approve a profile** only when it looks real, modest, and complete.

**Release a match** only after you are comfortable with both people. That action:

- Emails both members the other person’s phone, email, and wali details
- Sends an SMS if Twilio is configured
- Hides both profiles from browse

To put someone back in the pool later, open their profile in admin and tap **Reopen**.

**Promote a matchmaker**

1. They must already have a member account (invite + register).
2. Owner opens **Admin → Team**, enters their email, promotes them.
3. They can approve profiles and release matches. They cannot change the team.

---

## 6. Useful URLs

| URL | Who |
|---|---|
| `/` | Public landing |
| `/setup` | First owner only |
| `/register` | Invited members |
| `/login` | Everyone |
| `/verify-email` | After signup |
| `/verify-phone` | After email |
| `/onboarding` | Profile form |
| `/browse` | Approved members |
| `/matches` | Mutual / released matches |
| `/profile` | Edit own profile |
| `/settings` | Delete account |
| `/admin` | Owner and matchmakers |

Language toggle (EN / عربي) is in the header.

On a phone, use **Add to Home Screen** in Safari or Chrome. The app is a PWA.

---

## 7. Daily commands

```bash
npm run dev          # local site at http://localhost:3000
npm run build        # production build
npm run start        # serve that build
npm run lint         # eslint
npm run db:push      # apply schema to the current DATABASE_URL
npm run db:studio    # inspect tables in a browser
```

If you use Docker:

```bash
docker compose up -d
docker compose down
```

---

## 8. Deploy to Vercel

Local data lives in `data/pglite` and will **not** go to Vercel. Production needs a real Postgres URL (Neon is the usual match for Vercel).

### 8.1 Put the code on GitHub

On this Mac, `gh` may still be logged into an old account. Use the **new** GitHub account:

```bash
cd "/Users/aabumarzouq/Muslim dating app"
gh auth logout -h github.com
gh auth login -h github.com
```

Choose GitHub.com → HTTPS → login with a browser. Then tell Cursor to create the repo, or run:

```bash
git add .
git status   # confirm .env.local is NOT listed
git commit -m "Initial Ulfah app."
gh repo create ulfah --private --source=. --remote=origin --push
```

Change `ulfah` to whatever repo name you want. Never commit `.env.local`.

### 8.2 Connect Vercel

1. In Vercel, **Add New → Project**.
2. Import the GitHub repo (authorize GitHub if Vercel asks).
3. Framework: Next.js. Root directory: this repo.
4. Add environment variables (same names as `.env.example`):

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon connection string with `?sslmode=require` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://ulfah.com.au` |
| `CONTACT_ENCRYPTION_KEY` | another `openssl rand -base64 32` |
| `EMAIL_FROM` | e.g. `Ulfah <noreply@localhost>` until Resend is set |

5. Deploy.
6. On your computer, temporarily point `.env.local` `DATABASE_URL` at **Neon**, run `npm run db:push`, then switch it back to localhost for local PGlite.
7. Open `https://your-project.vercel.app/setup` and create the owner (once).

**Twilio:** use a number that can send SMS to Australian `+61 4` mobiles.

**Resend:** verify `ulfah.com.au`, then set `EMAIL_FROM` to something like `Ulfah <noreply@ulfah.com.au>`.

**Photos:** local files go in `data/uploads` (gitignored). Vercel’s disk is not permanent. Before a real launch, switch photo storage to Vercel Blob.

**Domain:** `ulfah.com.au` is registered. Point DNS to Vercel and set `BETTER_AUTH_URL=https://ulfah.com.au`.

Search engines are told not to index the site (`robots.txt` disallows all). Keep it invite-only.

---

## 9. Security notes

- Never commit `.env.local` or real secrets.
- Contact for sisters’ wali is encrypted with `CONTACT_ENCRYPTION_KEY`. If you lose that key, existing wali fields cannot be decrypted. Back it up.
- Browse APIs never return phone, email, or last name. Public profiles show **first name only**.
- Changing city, state, or marital status after approval sends the profile back to admin.
- Members can delete their account from Settings.
- `/setup` is disabled after the first owner exists.

---

## 10. If something breaks

**`Please provide required params for Postgres driver: [x] url: ''`**  
Drizzle did not see `DATABASE_URL`. Confirm `.env.local` exists in this folder and contains `DATABASE_URL=...`, then run `npm run db:push` again.

**`DATABASE_URL is not set`**  
`.env.local` is missing or the terminal is not in this folder.

**`db:push` fails with ECONNREFUSED / connect**  
Postgres is not running, or the URL/password is wrong. This machine does not have Docker. Use a Neon connection string, or install Docker Desktop and run `docker compose up -d`. For Neon, include `?sslmode=require`.

**Email link never arrives**  
In local mode, look at the terminal for `[email:dev]`. In production, check `RESEND_API_KEY` and `EMAIL_FROM`.

**SMS code never arrives**  
In local mode, look for `[sms:dev]` and a 6-digit code. In production, check Twilio SID, token, and from-number. Mobiles must be Australian `04…` / `+614…`.

**Cannot open `/setup`**  
An owner already exists. Use `/login`.

**Invite rejected**  
Code expired, revoked, used up, or locked to a different email.

**Profile not in browse**  
It is still `pending_review`, banned, or hidden after a released match. Approve or reopen it in admin.

**Port 3000 in use**

```bash
npx next dev -p 3001
```

Then set `BETTER_AUTH_URL=http://localhost:3001`.

---

## 11. Product rules (do not change casually)

These were decided before the first build:

- Australia only; member must currently live there
- English default, Arabic toggle
- Invite-only
- Email + phone OTP
- Admin must approve every profile
- Mutual interest → admin releases contact
- No in-app chat
- Wali required for sisters
- Photos optional, hidden until mutual match
- First name only in public
- Free for now
- After release, both profiles are hidden
- Owner + matchmaker roles

If you change a rule, update this file so the next person running the app knows.
