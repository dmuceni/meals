import { DAY_ORDER, SHOPPING_CATEGORIES } from "./constants.js";

export function normalizeDiet(rawDiet) {
  const phases = rawDiet?.plan?.phases || [];
  return {
    schemaVersion: rawDiet?.schemaVersion || "1.0",
    person: rawDiet?.person || rawDiet?.user || {},
    plan: {
      name: rawDiet?.plan?.name || "Piano alimentare",
      phases
    },
    foods: rawDiet?.foods || [],
    substitutions: rawDiet?.substitutions || {}
  };
}

export function getCurrentPhase(diet, selectedPhaseId) {
  const phases = diet?.plan?.phases || [];
  return phases.find((phase) => phase.id === selectedPhaseId) || phases[0] || null;
}

export function getMealsForDay(phase, dayKey) {
  return phase?.days?.[dayKey]?.meals || [];
}

export function buildShoppingList(phase) {
  const buckets = new Map();
  DAY_ORDER.forEach((dayKey) => {
    getMealsForDay(phase, dayKey).forEach((meal) => {
      meal.items?.forEach((rawItem) => {
        const item = parseShoppingItem(rawItem);
        if (!item) return;
        const key = `${item.category}|${item.unit}|${item.label.toLowerCase()}`;
        const current = buckets.get(key) || { ...item, quantity: 0 };
        current.quantity += item.quantity;
        buckets.set(key, current);
      });
    });
  });

  const items = [...buckets.values()].sort((a, b) => a.label.localeCompare(b.label, "it"));
  return SHOPPING_CATEGORIES.map((category) => ({
    ...category,
    items: items.filter((item) => item.category === category.key)
  }));
}

export function parseShoppingItem(rawItem) {
  const source = typeof rawItem === "string" ? { rawText: rawItem } : rawItem;
  const raw = (source.rawText || source.name || source.foodName || "").trim();
  const lower = raw.toLowerCase();
  if (!raw || lower.includes("pasto libero")) return null;

  if (source.quantity && source.unit && source.name) {
    return {
      label: normalizeLabel(source.name),
      quantity: Number(source.quantity),
      unit: source.unit,
      category: source.category || classifyFood(source.name)
    };
  }

  if (lower === "verdure") {
    return { label: "verdure", quantity: 1, unit: "porzione", category: "produce" };
  }

  const pieceMatch = raw.match(/^#\s*(\d+(?:,\d+)?)\s+(.+)$/i);
  if (pieceMatch) {
    const label = normalizeLabel(pieceMatch[2]);
    return { label, quantity: Number(pieceMatch[1].replace(",", ".")), unit: "pz", category: classifyFood(label) };
  }

  const quantityMatch = raw.match(/^(\d+(?:,\d+)?)\s*(g|ml)\s+(.+)$/i);
  if (quantityMatch) {
    const label = normalizeLabel(quantityMatch[3]);
    return {
      label,
      quantity: Number(quantityMatch[1].replace(",", ".")),
      unit: quantityMatch[2].toLowerCase(),
      category: classifyFood(label)
    };
  }

  const label = normalizeLabel(raw);
  return { label, quantity: 1, unit: "voce", category: classifyFood(label) };
}

export function classifyFood(label) {
  const lower = label.toLowerCase();
  if (["frutto", "frutta", "marmellata", "verdure", "mele", "banana"].some((word) => lower.includes(word))) return "produce";
  if (["pasta", "riso", "farro", "orzo", "pane", "biscotti", "fette", "cornflakes", "gnocchi", "patate", "legumi", "gallette", "wasa", "quinoa", "cous", "ciclodestrine"].some((word) => lower.includes(word))) return "carbs";
  if (["pollo", "tacchino", "pesce", "uova", "manzo", "cavallo", "vitello", "gamberi", "proteine", "aminoacidi", "essenziali", "eaa"].some((word) => lower.includes(word))) return "proteins";
  if (["latte", "yogurt", "budino", "mozzarella", "ricotta", "fiocchi", "kefir", "bevanda"].some((word) => lower.includes(word))) return "dairy";
  if (["olio", "avocado", "frutta secca", "burro d'arachidi", "sale"].some((word) => lower.includes(word))) return "fats";
  return "other";
}

export function normalizeLabel(label) {
  return label
    .replace(/\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\bevo\b/g, "EVO");
}

export function formatAmount(item) {
  const quantity = Number.isInteger(item.quantity) ? item.quantity : Number(item.quantity.toFixed(1));
  if (item.unit === "porzione") return `${quantity} ${quantity === 1 ? "porzione" : "porzioni"}`;
  if (item.unit === "voce") return `${quantity}x`;
  return `${quantity}${item.unit}`;
}

export function validateDietJson(diet) {
  const errors = [];
  if (!diet || typeof diet !== "object") errors.push("Il JSON deve essere un oggetto.");
  if (!diet?.schemaVersion) errors.push("schemaVersion obbligatorio.");
  if (!diet?.person?.displayName && !diet?.person?.firstName) errors.push("person.displayName o person.firstName obbligatorio.");
  if (!Array.isArray(diet?.plan?.phases) || diet.plan.phases.length === 0) errors.push("plan.phases deve contenere almeno una fase.");
  diet?.plan?.phases?.forEach((phase, phaseIndex) => {
    if (!phase.id) errors.push(`plan.phases[${phaseIndex}].id obbligatorio.`);
    if (!phase.days || typeof phase.days !== "object") errors.push(`plan.phases[${phaseIndex}].days obbligatorio.`);
  });
  return errors;
}
