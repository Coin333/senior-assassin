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

1. Push this repo to GitHub.
2. In Railway, create a new project from this GitHub repo.
3. Add a **Volume** mounted at `/data`. This persists your SQLite database across deploys.
4. Set these environment variables in Railway:
   - `DATABASE_URL=/data/app.db`
   - `APP_PASSWORD=your-access-code` (optional but recommended)
5. Railway auto-detects the Dockerfile and builds. First deploy runs migrations automatically.

Open the generated URL. If you set `APP_PASSWORD`, enter it on first visit.

## Environment variables

| Var            | Required | Description                                                                      |
| -------------- | -------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL` | yes      | Path to SQLite file. Default `./data/app.db` locally, `/data/app.db` on Railway. |
| `APP_PASSWORD` | no       | Single shared password. If unset, the app is open to anyone with the URL.        |
| `PORT`         | no       | Railway sets this. Default 3000.                                                 |

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
