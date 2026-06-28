# Meals PWA

PWA multi utente per piani alimentari, alternative, lista della spesa e import dieta da JSON standard.

## Stack

- Frontend: Vite + React
- Hosting: Vercel Hobby
- Database: Neon Postgres
- Auth: Supabase Auth
- Email: Resend opzionale per notifiche app; per password reset usa Supabase Auth
- Storage immagini: Vercel Blob

## Setup locale

1. Installa dipendenze:

```bash
npm install
```

2. Crea `.env.local` partendo da `docs/env.example`.

3. Crea le tabelle Neon eseguendo:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

4. Avvia:

```bash
npm run dev
```

Questo comando avvia sia Vite sia le route API locali (`/api/me`, `/api/diet`, `/api/blob-upload`).

## Variabili ambiente

Vedi [docs/env.example](docs/env.example).

Minime richieste:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

Opzionali:

- `BLOB_READ_WRITE_TOKEN`
- `RESEND_API_KEY`
- `RESEND_FROM`

## Import dieta

Il JSON caricato dalla SPA deve seguire [docs/diet-json.schema.json](docs/diet-json.schema.json).

Per generare offline il JSON partendo da un PDF, usa il prompt in [docs/pdf-to-json-prompt.md](docs/pdf-to-json-prompt.md). Un esempio minimale si trova in [docs/example-diet.sonia.json](docs/example-diet.sonia.json).

## Note

- Ogni utente Supabase ha un `profile` in Neon, collegato tramite `auth_user_id`.
- Ogni upload JSON crea una nuova dieta attiva e disattiva le precedenti per lo stesso utente.
- Gli alimenti vengono upsertati in `food_items`.
- Le combinazioni e i gruppi di sostituzione, se presenti nel JSON, vengono salvati nelle rispettive tabelle.
- Non pubblicare su Vercel senza conferma esplicita.
