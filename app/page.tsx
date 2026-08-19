import Link from "next/link";
import { Logo } from "@/components/logo";
import { APP_NAME_AR } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { countOwners, getMe, nextPathForUser } from "@/lib/me";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const { locale, t } = await getDictionary();
  const session = await getSession();
  const me = session ? await getMe() : null;
  const owners = await countOwners();
  const dbDown = owners === null;
  const href = me
    ? nextPathForUser({
        role: me.role,
        emailVerified: Boolean(me.emailVerified),
        phoneVerified: Boolean(me.phoneVerified),
        memberStatus: me.memberStatus,
      })
    : "/register";

  return (
    <main className="space-y-12 pb-10">
      {dbDown ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-950">
          <p className="font-medium">Postgres is not connected.</p>
          {process.env.VERCEL ? (
            <p className="mt-2 leading-relaxed">
              The live app needs the Neon connection string. If you connected a Vercel
              Postgres/Neon store, wait for the latest deploy to finish, then refresh.
            </p>
          ) : (
            <>
              <p className="mt-2 leading-relaxed">
                Ignore any <code>devtools://</code> debugger link. Use{" "}
                <a className="underline" href="http://localhost:3000">
                  http://localhost:3000
                </a>
                . Create a free database at{" "}
                <a className="underline" href="https://neon.tech" target="_blank" rel="noreferrer">
                  neon.tech
                </a>
                , paste the connection string into <code>.env.local</code> as{" "}
                <code>DATABASE_URL</code>, then run:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-white p-3 text-xs">
                {`npm run db:push
npm run dev`}
              </pre>
            </>
          )}
        </div>
      ) : null}
      <section className="overflow-hidden rounded-[2rem] border border-gold/25 bg-[radial-gradient(circle_at_top_right,#c6a36b28,transparent_42%),linear-gradient(180deg,#fbfaf6,#f4efe4)] px-6 py-12 sm:px-10">
        <p className="text-xs uppercase tracking-[0.25em] text-sage">{t.landing.kicker}</p>
        <div className="mt-6 flex items-center gap-4">
          <Logo className="h-14 w-14" />
          <div>
            {locale !== "ar" ? (
              <p className="font-arabic text-lg text-gold" dir="rtl">
                {APP_NAME_AR}
              </p>
            ) : null}
            <h1 className="font-display text-4xl leading-tight text-forest sm:text-5xl">
              {t.brand}
            </h1>
          </div>
        </div>
        <p className="mt-6 max-w-xl font-display text-2xl text-forest sm:text-3xl">
          {t.landing.title}
        </p>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-forest/80">{t.landing.body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 text-cream"
          >
            {session ? "Continue" : t.landing.cta}
          </Link>
          {!session ? (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-gold/40 px-6 py-3 text-forest"
            >
              {t.landing.signIn}
            </Link>
          ) : null}
        </div>
        {owners === 0 ? (
          <p className="mt-6 text-sm text-forest/70">
            First time here?{" "}
            <Link href="/setup" className="underline">
              Create the owner account
            </Link>
            .
          </p>
        ) : null}
        <p className="mt-8 text-xs tracking-[0.18em] text-sage uppercase">ulfah.com.au</p>
      </section>
      <section>
        <h2 className="font-display text-3xl text-forest">{t.landing.stepsTitle}</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {[t.landing.step1, t.landing.step2, t.landing.step3, t.landing.step4].map(
            (step, index) => (
              <li key={step} className="rounded-3xl border border-gold/20 bg-paper p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">0{index + 1}</p>
                <p className="mt-2 text-forest">{step}</p>
              </li>
            ),
          )}
        </ol>
      </section>
    </main>
  );
}
