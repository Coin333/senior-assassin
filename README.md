# Senior Assassin Command

Operational dashboard for tracking Senior Assassin targets, plays, intel, and your own defense. Built for one player who takes the bracket seriously.

## What it does

- **Brief**: daily operational summary, active contract, threat sweep, kill list
- **Targets**: full dossiers with vehicle, address, schedule grid, photos, romantic interest, parents schedule
- **Network**: force-directed visual graph of every target, friend, asset, and family connection. Click any node to open their profile
- **Map**: unified geo-pinned view of every Snap Map check, target home, hangout, gas station, and safe zone
- **Plays**: canon playbook (DoorDash, Recruiter, Lost Dog, Headlights, Car Alarm), custom operations, kill brief generator, stall library, equipment checklist
- **Bracket**: round history, leaderboard, win probability
- **Team**: asset roster, squad chat, "I am safe" check-ins, operation assignments
- **Defense**: suspicious activity log, deception post scheduler, routine audit grid, defense doctrine
- **Settings**: bracket size, current week, endgame mode toggle

## Stack

Next.js 15 (App Router), TypeScript, Tailwind, SQLite via Drizzle ORM, Leaflet for the map, d3-force for the network graph.

## Run locally

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Visit http://localhost:3000. The database lives at `./data/app.db`.

## Deploy to Railway

Railway is the easiest path because Railway volumes persist a SQLite file across deploys.

1. Push this repo to GitHub.
2. In Railway, create a new project from this GitHub repo.
3. Add a **Volume** mounted at `/data`. This persists your SQLite database across deploys.
4. Set these environment variables in Railway:
   - `DATABASE_URL=file:/data/app.db`
   - `APP_PASSWORD=your-access-code`
5. Railway auto-detects the Dockerfile and builds. First boot runs migrations automatically.

Open the generated URL and log in with `APP_PASSWORD`.

## Deploy to Vercel

Vercel functions run on a read-only, ephemeral filesystem, so the database has to live remotely. Use **Turso** (hosted libsql, free tier covers this).

1. Create a Turso database:
   ```bash
   turso db create senior-assassin
   turso db show senior-assassin --url       # libsql://...
   turso db tokens create senior-assassin    # auth token
   ```
2. Push the schema to Turso once from your laptop:
   ```bash
   DATABASE_URL="libsql://your-db-name-xxx.turso.io" \
   DATABASE_AUTH_TOKEN="your-token" \
   npx drizzle-kit push
   ```
3. Push this repo to GitHub.
4. In Vercel, import the GitHub repo. Framework auto-detects as Next.js.
5. Set the same three env vars on Vercel (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `APP_PASSWORD`).
6. Deploy. Subsequent schema changes: re-run step 2 locally.

The repo ships with `vercel.json` pinning `npm install --legacy-peer-deps` so the install resolves cleanly.

## Environment variables

| Var                   | Required        | Description                                                                                                                  |
| --------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | yes             | `file:/data/app.db` for Railway or local. `libsql://...` for Vercel + Turso. Defaults to `file:./data/app.db` for local dev. |
| `DATABASE_AUTH_TOKEN` | only with Turso | Token from `turso db tokens create`. Leave unset when using a local file.                                                    |
| `APP_PASSWORD`        | yes in prod     | Single shared password. If unset, the app is open to anyone with the URL.                                                    |
| `PORT`                | no              | Railway sets this. Vercel ignores it. Default 3000.                                                                          |

## Data model

Everything is unified around the `people` table. Targets, friends, family, and team assets are all people with different `role` values. This means:

- The Network graph automatically pulls in every person you have stored
- Adding a target's friend creates a connection that shows on the network
- Romantic interest links one person to another in the same table
- The Snap Map "check" you log on a target's profile becomes a pin on the unified Map page
- A kill brief pulls vehicle and address straight from the target profile

No data lives in isolation. Everything ties back to the network and the map.

## Notes

- All photos are stored as URLs. Use Imgur, ImgBB, or paste a Google Photos share link.
- Coordinates: drop a pin in Google Maps, right-click, copy the lat/lng.
- Equipment defaults can be loaded with one click from the Plays page.
- Endgame mode is a manual toggle. Flip it in Settings when you hit top 5.

Built with D1 Vibe Coding
