# Ulfah

Private, invite-only Muslim marriage matching for people living in Australia.

Profiles stay modest. Phone, email, and wali details are released only after **mutual interest** and a **matchmaker** review. There is no in-app chat.

**Full setup, env vars, admin steps, deploy, and troubleshooting:** see [INSTRUCTIONS.md](./INSTRUCTIONS.md).

## Quick start

```bash
npm install
cp .env.example .env.local
# add DATABASE_URL and the two secrets — details in INSTRUCTIONS.md
npm run db:push
npm run dev
```

Then open [http://localhost:3000/setup](http://localhost:3000/setup) to create the owner account.

Suggested domains: `ulfah.com.au`, `ulfah.au`, `getulfah.com`.
