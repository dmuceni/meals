const allowedMealTypes = new Set(["breakfast", "lunch", "snack", "dinner"]);

export function validateDietJson(diet) {
  const errors = [];
  if (!diet || typeof diet !== "object") errors.push("Il JSON dieta deve essere un oggetto.");
  if (!diet?.schemaVersion) errors.push("schemaVersion obbligatorio.");
  if (!diet?.person?.displayName && !diet?.person?.firstName) errors.push("person.displayName o person.firstName obbligatorio.");
  if (!Array.isArray(diet?.plan?.phases) || diet.plan.phases.length === 0) errors.push("plan.phases deve contenere almeno una fase.");

  diet?.plan?.phases?.forEach((phase, phaseIndex) => {
    if (!phase.id) errors.push(`plan.phases[${phaseIndex}].id obbligatorio.`);
    if (!phase.label) errors.push(`plan.phases[${phaseIndex}].label obbligatorio.`);
    if (!phase.days || typeof phase.days !== "object") errors.push(`plan.phases[${phaseIndex}].days obbligatorio.`);
    Object.entries(phase.days || {}).forEach(([dayKey, day]) => {
      if (!Array.isArray(day.meals)) errors.push(`${phase.id}.${dayKey}.meals deve essere un array.`);
      day.meals?.forEach((meal, mealIndex) => {
        if (!allowedMealTypes.has(meal.type)) errors.push(`${phase.id}.${dayKey}.meals[${mealIndex}].type non valido.`);
        if (!Array.isArray(meal.items)) errors.push(`${phase.id}.${dayKey}.meals[${mealIndex}].items deve essere un array.`);
      });
    });
  });

  return errors;
}

export function collectFoodRows(diet) {
  const rows = new Map();
  diet.foods?.forEach((food) => {
    if (food.name) rows.set(food.name.toLowerCase(), food);
  });

  diet.plan?.phases?.forEach((phase) => {
    Object.values(phase.days || {}).forEach((day) => {
      day.meals?.forEach((meal) => {
        meal.items?.forEach((item) => {
          if (typeof item === "string") {
            rows.set(item.toLowerCase(), { name: item, rawText: item });
          } else if (item?.name || item?.foodName || item?.rawText) {
            const name = item.name || item.foodName || item.rawText;
            rows.set(name.toLowerCase(), { ...item, name });
          }
        });
      });
    });
  });

  return [...rows.values()];
}
