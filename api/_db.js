import { neon } from "@neondatabase/serverless";

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error("Configura DATABASE_URL con la connection string Neon.");
  }
  return neon(databaseUrl);
}

export async function ensureProfile(sql, user) {
  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Utente";
  const rows = await sql`
    insert into profiles (auth_user_id, email, display_name)
    values (${user.id}, ${user.email}, ${displayName})
    on conflict (auth_user_id)
    do update set email = excluded.email, updated_at = now()
    returning *
  `;
  return rows[0];
}
