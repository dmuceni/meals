import { getSql, ensureProfile } from "./_db.js";
import { handleError, json, requireUser } from "./_auth.js";

export default async function handler(req, res) {
  try {
    const user = await requireUser(req);
    const sql = getSql();
    const profile = await ensureProfile(sql, user);
    const diets = await sql`
      select id, name, is_active, created_at
      from diets
      where profile_id = ${profile.id}
      order by is_active desc, created_at desc
    `;
    json(res, 200, { profile, diets });
  } catch (error) {
    handleError(res, error);
  }
}
