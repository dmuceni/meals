import { getSql, ensureProfile } from "./_db.js";
import { handleError, json, readJson, requireUser } from "./_auth.js";
import { collectFoodRows, validateDietJson } from "./_diet-standard.js";
import { sendDietImportedEmail } from "./_email.js";

export default async function handler(req, res) {
  try {
    const user = await requireUser(req);
    const sql = getSql();
    const profile = await ensureProfile(sql, user);

    if (req.method === "GET") {
      const rows = await sql`
        select id, name, diet_json, is_active, created_at, updated_at
        from diets
        where profile_id = ${profile.id} and is_active = true
        order by updated_at desc
        limit 1
      `;
      json(res, 200, { diet: rows[0] || null });
      return;
    }

    if (req.method !== "POST") {
      json(res, 405, { error: "Metodo non supportato." });
      return;
    }

    const body = await readJson(req);
    const diet = body.diet;
    const errors = validateDietJson(diet);
    if (errors.length) {
      json(res, 422, { error: errors.join(" ") });
      return;
    }

    const displayName = diet.person.displayName || [diet.person.firstName, diet.person.lastName].filter(Boolean).join(" ");
    await sql`
      update profiles
      set display_name = ${displayName}, updated_at = now()
      where id = ${profile.id}
    `;

    await sql`update diets set is_active = false where profile_id = ${profile.id}`;
    const inserted = await sql`
      insert into diets (profile_id, name, diet_json, is_active)
      values (${profile.id}, ${diet.plan.name || "Piano alimentare"}, cast(${JSON.stringify(diet)} as jsonb), true)
      returning *
    `;

    const foods = collectFoodRows(diet);
    for (const food of foods) {
      await sql`
        insert into food_items (canonical_name, display_name, category, metadata)
        values (${(food.name || food.rawText).toLowerCase()}, ${food.name || food.rawText}, ${food.category || null}, cast(${JSON.stringify(food)} as jsonb))
        on conflict (canonical_name)
        do update set display_name = excluded.display_name, category = coalesce(excluded.category, food_items.category), metadata = food_items.metadata || excluded.metadata
      `;
    }

    for (const combination of diet.combinations || []) {
      await sql`
        insert into food_combinations (name, category, items, macros, metadata)
        values (
          ${combination.name || "Combinazione"},
          ${combination.category || null},
          cast(${JSON.stringify(combination.items || [])} as jsonb),
          cast(${JSON.stringify(combination.macros || {})} as jsonb),
          cast(${JSON.stringify(combination)} as jsonb)
        )
      `;
    }

    for (const substitutionGroup of diet.substitutions?.groups || []) {
      await sql`
        insert into food_substitutions (group_key, metadata)
        values (${substitutionGroup.key || substitutionGroup.name || "generic"}, cast(${JSON.stringify(substitutionGroup)} as jsonb))
      `;
    }

    await sendDietImportedEmail({
      to: profile.email,
      displayName,
      planName: diet.plan.name
    });

    json(res, 200, { diet: inserted[0] });
  } catch (error) {
    handleError(res, error);
  }
}
