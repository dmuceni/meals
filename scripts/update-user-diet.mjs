import fs from "node:fs";
import { neon } from "@neondatabase/serverless";

const [, , emailArg, dietPathArg] = process.argv;
const email = emailArg?.trim().toLowerCase();
const dietPath = dietPathArg || "docs/import-davide-muceni.json";
const shouldList = dietPathArg === "--list";

if (!email) {
  throw new Error("Usage: node scripts/update-user-diet.mjs email@example.com docs/import.json");
}

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL/POSTGRES_URL mancante in .env.local");
}

const sql = neon(databaseUrl);
if (shouldList) {
  const rows = await sql`
    select
      p.id as profile_id,
      p.auth_user_id,
      p.email,
      p.display_name,
      d.id as diet_id,
      d.name,
      d.is_active,
      d.updated_at,
      d.diet_json->'source'->>'fileName' as source_file
    from profiles p
    left join diets d on d.profile_id = p.id
    where lower(p.email) = ${email}
    order by p.created_at asc, d.is_active desc, d.updated_at desc
  `;
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

const diet = JSON.parse(fs.readFileSync(dietPath, "utf8"));
const profiles = await sql`
  select id, email, display_name
  from profiles
  where lower(email) = ${email}
`;

if (!profiles.length) {
  throw new Error(`Profilo non trovato per ${email}`);
}

const results = [];
for (const profile of profiles) {
  const displayName =
    diet.person?.displayName ||
    [diet.person?.firstName, diet.person?.lastName].filter(Boolean).join(" ") ||
    profile.display_name;

  const current = await sql`
    select id, name, diet_json, diet_json->'source'->>'fileName' as source_file
    from diets
    where profile_id = ${profile.id} and is_active = true
    limit 1
  `;

  if (
    current[0]?.name === (diet.plan?.name || "Piano alimentare") &&
    current[0]?.source_file === diet.source?.fileName &&
    JSON.stringify(current[0]?.diet_json) === JSON.stringify(diet)
  ) {
    results.push({ email: profile.email, profileId: profile.id, skipped: true, activeDiet: current[0] });
    continue;
  }

  await sql`
    update profiles
    set display_name = ${displayName}, updated_at = now()
    where id = ${profile.id}
  `;

  const inserted = await sql`
    insert into diets (profile_id, name, diet_json, is_active)
    values (${profile.id}, ${diet.plan?.name || "Piano alimentare"}, cast(${JSON.stringify(diet)} as jsonb), false)
    returning id, name, created_at
  `;

  await sql`
    update diets
    set is_active = false, updated_at = now()
    where profile_id = ${profile.id} and id <> ${inserted[0].id}
  `;

  await sql`
    update diets
    set is_active = true, updated_at = now()
    where id = ${inserted[0].id}
  `;

  const active = await sql`
    select id, name, is_active, updated_at
    from diets
    where profile_id = ${profile.id} and is_active = true
  `;

  results.push({ email: profile.email, profileId: profile.id, skipped: false, activeDiet: active[0] });
}

console.log(JSON.stringify(results, null, 2));

function loadLocalEnv() {
  if (!fs.existsSync(".env.local")) return;

  const lines = fs.readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}
