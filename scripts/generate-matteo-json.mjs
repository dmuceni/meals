import fs from "node:fs";

const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const dayNotes = ["#1 compressa multivitamin", "#2 compresse omega 3"];

const halfAvocado = {
  name: "avocado",
  quantity: 0.5,
  unit: "pz",
  rawText: "#MEZZO AVOCADO",
  category: "fats"
};

function raw(item) {
  return typeof item === "string" ? item : item.rawText || item.name;
}

function fmt(value) {
  return String(Math.round(value));
}

function amountOf(item) {
  const text = raw(item);
  const gram = text.match(/^(\d+(?:[,.]\d+)?)\s*g\b/i);
  if (gram) return Number(gram[1].replace(",", "."));
  const ml = text.match(/^(\d+(?:[,.]\d+)?)\s*ml\b/i);
  if (ml) return Number(ml[1].replace(",", "."));
  const pieces = text.match(/^#\s*(\d+(?:[,.]\d+)?)\b/i);
  if (pieces) return Number(pieces[1].replace(",", "."));
  return null;
}

function substituteCarb(item, variant) {
  const text = raw(item).toLowerCase();
  const amount = amountOf(item);
  if (!amount) {
    if (text.includes("marmellata") || text.includes("miele")) return variant === 1 ? "#1 frutto" : "25g marmellata";
    return null;
  }

  if (/(pasta|riso|farro|orzo|avena|fette biscottate|fiocchi|cereali|gallette|wasa)/i.test(text) && !text.includes("pane")) {
    if (variant === 1) return `${fmt(amount * 1.5)}g pane di qualsiasi cereale`;
    if (variant === 2) return `${fmt(amount * 3.75)}g patate/patate dolci`;
    return `${fmt(amount * 2.5)}g legumi/mais`;
  }

  if (/pane|piadina|tortillas/i.test(text)) {
    if (variant === 1) return `${fmt(amount / 1.5)}g pasta/riso/farro/orzo`;
    if (variant === 2) return `${fmt(amount * 2.5)}g patate/patate dolci`;
    return `${fmt(amount * 1.5)}g gnocchi di patate`;
  }

  if (/patate/i.test(text)) {
    if (variant === 1) return `${fmt(amount / 3.75)}g pasta/riso/farro/orzo`;
    if (variant === 2) return `${fmt(amount / 2.5)}g pane di qualsiasi cereale`;
    return `${fmt(amount * 0.6)}g gnocchi di patate`;
  }

  if (/legumi|mais/i.test(text)) {
    if (variant === 1) return `${fmt(amount / 2.5)}g pasta/riso/farro/orzo`;
    if (variant === 2) return `${fmt(amount * 0.6)}g pane di qualsiasi cereale`;
    return `${fmt(amount * 1.5)}g patate/patate dolci`;
  }

  if (/gnocchi|polenta/i.test(text)) {
    if (variant === 1) return `${fmt(amount / 2.25)}g pasta/riso/farro/orzo`;
    if (variant === 2) return `${fmt(amount * 0.68)}g pane di qualsiasi cereale`;
    return `${fmt(amount * 1.7)}g patate/patate dolci`;
  }

  if (/crackers/i.test(text)) return variant === 1 ? `${fmt(amount)}g gallette/wasa` : `${fmt(amount)}g avena/riso`;
  return null;
}

function substituteSnackCarb(item, variant) {
  const text = raw(item).toLowerCase();
  const amount = amountOf(item);
  if (!amount) {
    if (text.includes("marmellata") || text.includes("miele")) return variant === 1 ? "#1 frutto" : "25g marmellata";
    return null;
  }

  if (/crackers/i.test(text)) return variant === 1 ? `${fmt(amount)}g gallette/wasa` : `${fmt(amount)}g avena/riso`;
  if (/pane|piadina|tortillas/i.test(text)) {
    if (variant === 1) return `${fmt(amount / 1.5)}g gallette/wasa`;
    if (variant === 2) return `${fmt(amount / 1.5)}g avena/riso`;
    return `${fmt(amount)}g fette biscottate`;
  }
  if (/(pasta|riso|farro|orzo|avena|fette biscottate|fiocchi|cereali|gallette|wasa)/i.test(text)) {
    if (variant === 1) return `${fmt(amount * 1.5)}g pane di segale`;
    if (variant === 2) return `${fmt(amount)}g gallette/wasa`;
    return `${fmt(amount)}g avena/riso`;
  }

  return substituteCarb(item, variant);
}

function substituteProtein(item, variant) {
  const text = raw(item).toLowerCase();
  const amount = amountOf(item);

  if (/pollo|tacchino|pesce magro|tonno al naturale|vitello|gamber/i.test(text) && amount) {
    if (variant === 1) return `${fmt(amount)}g pesce magro`;
    if (variant === 2) return `${fmt(amount)}g pollo/tacchino`;
    return `${fmt(amount * 2)}g albume`;
  }

  if (/manzo|cavallo|pesce grasso|salmone|sgombro|tonno fresco/i.test(text) && amount) {
    if (variant === 1) return `${fmt(amount)}g pesce grasso`;
    if (variant === 2) return "#2 uova";
    return `${fmt(amount)}g ricotta light/mozzarella light`;
  }

  if (/uova|uovo/i.test(text)) {
    if (variant === 1) return "100g manzo/cavallo";
    if (variant === 2) return "100g pesce grasso";
    return "100g ricotta light/mozzarella light";
  }

  if (/ricotta|mozzarella/i.test(text) && amount) {
    if (variant === 1) return `${fmt(amount)}g manzo/cavallo`;
    if (variant === 2) return `${fmt(amount)}g pesce grasso`;
    return "#2 uova";
  }

  if (/fiocchi di latte/i.test(text) && amount) {
    if (variant === 1) return `${fmt(amount / 2)}g pollo/tacchino`;
    if (variant === 2) return `${fmt(amount / 2)}g pesce magro`;
    return `${fmt((amount / 200) * 30)}g whey protein isolate`;
  }

  if (/whey|proteine/i.test(text) && amount) {
    if (variant === 1) return `${fmt((amount / 30) * 200)}g albume`;
    if (variant === 2) return `${fmt((amount / 30) * 100)}g pollo/tacchino`;
    return `${fmt((amount / 30) * 150)}g yogurt greco zero grassi`;
  }

  return null;
}

function substituteDairy(item, variant) {
  const text = raw(item).toLowerCase();
  if (!/latte|yogurt|kefir|bevanda vegetale|albume/i.test(text)) return null;
  if (variant === 1) return "150g yogurt greco zero grassi";
  if (variant === 2) return "200ml bevanda vegetale";
  return "150g albume";
}

function substituteFat(item, variant) {
  const text = raw(item).toLowerCase();
  if (!/frutta secca|burro|avocado|cioccolato|olio|semi|tahina/i.test(text)) return null;
  if (variant === 1) return "20g frutta secca";
  if (variant === 2) return "#MEZZO AVOCADO";
  return "15g olio EVO";
}

function replaceOne(items, matcher) {
  const next = [...items];
  for (let index = 0; index < next.length; index += 1) {
    const replacement = matcher(next[index]);
    if (replacement) {
      next[index] = replacement;
      return next;
    }
  }
  return null;
}

function buildMealAlternatives(items, mealType) {
  if (items.length === 1 && /barretta proteica/i.test(raw(items[0]))) {
    return [
      {
        label: "Alternativa barretta",
        items: ["50g affettato di pollo/tacchino", "20g gallette"]
      },
      {
        label: "Alternativa barretta",
        items: ["150g yogurt greco zero grassi", "20g fiocchi di mais"]
      },
      {
        label: "Alternativa barretta",
        items: ["30g whey protein isolate", "20g wasa"]
      }
    ];
  }

  const alternatives = [
    {
      label: "Alternativa carboidrati",
      items: replaceOne(items, (item) => mealType === "snack" ? substituteSnackCarb(item, 1) : substituteCarb(item, 1))
    },
    {
      label: "Alternativa carboidrati",
      items: replaceOne(items, (item) => mealType === "snack" ? substituteSnackCarb(item, 2) : substituteCarb(item, 2))
    },
    {
      label: "Alternativa proteine",
      items: replaceOne(items, (item) => substituteProtein(item, 1) || substituteDairy(item, 1))
    },
    {
      label: "Alternativa grassi",
      items: replaceOne(items, (item) => substituteFat(item, 2))
    }
  ].filter((alternative) => alternative.items);

  const seen = new Set();
  return alternatives.filter((alternative) => {
    const key = alternative.items.map(raw).join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return key !== items.map(raw).join("|");
  });
}

function day(items) {
  return {
    notes: dayNotes,
    meals: [
      { type: "breakfast", title: "Pasto 1", items: items[0] },
      { type: "snack", title: "Pasto 2", items: items[1] },
      { type: "lunch", title: "Pasto 3", items: items[2] },
      { type: "snack", title: "Pasto 4", items: items[3] },
      { type: "dinner", title: "Pasto 5", items: items[4] }
    ].filter((meal) => meal.items.length > 0).map((meal) => ({
      ...meal,
      alternatives: buildMealAlternatives(meal.items, meal.type)
    }))
  };
}

const phaseOneByDay = {
  monday: day([
    ["200ml latte vegetale/scremato", "60g fiocchi d'avena", "20g cioccolato fondente", "#1 frutto"],
    ["30g crackers di riso / integrali", "30g whey protein isolate"],
    ["130g pasta (integrale)", "100g ricotta light", "15g olio EVO"],
    ["50g pane di segale", "marmellata/miele", "20g burro d'arachidi"],
    ["80g riso/farro/orzo", "200g petto di pollo/tacchino", "verdura", "20g olio EVO"]
  ]),
  tuesday: day([
    ["150g yogurt greco zero grassi", "60g fiocchi di mais", "20g frutta secca", "#1 frutto"],
    ["barretta proteica"],
    ["190g pane (integrale)", "#2 uova", "15g olio EVO"],
    ["50g pane di segale", "20g burro d'arachidi"],
    ["300g patate", "200g pesce magro", "verdura", "20g olio EVO"]
  ]),
  wednesday: day([
    ["200ml latte vegetale/scremato", "60g gallette", "20g crema di frutta secca", "#1 frutto/marmellata"],
    ["30g gallette di mais/riso", "150g yogurt greco zero grassi"],
    ["130g pasta (integrale)", "200g fiocchi di latte zero grassi", "15g olio EVO"],
    ["30g crackers di riso / integrali", "20g frutta secca"],
    ["120g pane (integrale)", "200g manzo/cavallo", "verdura", "20g olio EVO"]
  ]),
  thursday: day([
    ["200ml latte vegetale/scremato", "60g fette biscottate", "20g burro arachidi", "#1 frutto/marmellata"],
    ["30g crackers di riso / integrali", "30g whey protein isolate"],
    ["220g pane (integrale)", "#2 uova", "15g olio EVO"],
    ["50g pane di segale", "marmellata/miele", "20g burro d'arachidi"],
    ["300g patate", "200g petto di pollo/tacchino", "verdura", "20g olio EVO"]
  ]),
  friday: day([
    ["150g yogurt greco zero grassi", "60g fiocchi di mais", "20g frutta secca", "#1 frutto"],
    ["30g crackers di riso / integrali", "30g whey protein isolate"],
    ["130g pasta (integrale)", "100g mozzarella light", "15g olio EVO"],
    ["50g pane di segale", "20g burro d'arachidi"],
    ["200g legumi (cotti)", "200g pesce magro", "verdura", "20g olio EVO"]
  ]),
  saturday: day([
    ["200ml latte vegetale/scremato", "60g gallette", "20g crema di frutta secca", "#1 frutto/marmellata"],
    ["barretta proteica"],
    ["130g riso/farro/orzo", "100g tonno al naturale", "15g olio EVO"],
    ["30g crackers di riso / integrali", "20g frutta secca"],
    ["pasto libero"]
  ]),
  sunday: day([
    ["120-150g albume (per pancake)", "60g farina d'avena", "20g cioccolato fondente", "#1 frutto/marmellata"],
    ["30g gallette di mais/riso", "150g yogurt greco zero grassi"],
    ["300g gnocchi di patate", "100g pesce grasso", "15g olio EVO"],
    ["50g pane di segale", "marmellata/miele", "20g burro d'arachidi"],
    ["200g legumi (cotti)", "200g petto di pollo/tacchino", "verdura", "20g olio EVO"]
  ])
};

const phaseTwoByDay = {
  monday: day([
    ["200ml latte vegetale/scremato", "60g fiocchi d'avena", "20g cioccolato fondente", "#1 frutto"],
    ["30g crackers di riso / integrali", "30g whey protein isolate"],
    ["150g pasta (integrale)", "100g ricotta light", "20g olio EVO"],
    ["50g pane di segale", "marmellata/miele", "20g burro d'arachidi"],
    ["80g riso/farro/orzo", "200g petto di pollo/tacchino", "verdura", "20g olio EVO"]
  ]),
  tuesday: day([
    ["150g yogurt greco zero grassi", "60g fiocchi di mais", "20g frutta secca", "#1 frutto"],
    ["barretta proteica"],
    ["220g pane (integrale)", "#2 uova", "20g olio EVO"],
    ["50g pane di segale", halfAvocado],
    ["300g patate", "200g pesce magro", "verdura", "20g olio EVO"]
  ]),
  wednesday: day([
    ["200ml latte vegetale/scremato", "60g gallette", "20g crema di frutta secca", "#1 frutto/marmellata"],
    ["30g gallette di mais/riso", "150g yogurt greco zero grassi"],
    ["150g pasta (integrale)", "200g fiocchi di latte zero grassi", "20g olio EVO"],
    ["30g crackers di riso / integrali", "20g frutta secca"],
    ["120g pane (integrale)", "200g manzo/cavallo", "verdura", "20g olio EVO"]
  ]),
  thursday: day([
    ["200ml latte vegetale/scremato", "60g fette biscottate", "20g burro arachidi", "#1 frutto/marmellata"],
    ["30g crackers di riso / integrali", "30g whey protein isolate"],
    ["220g pane (integrale)", "#2 uova", "20g olio EVO"],
    ["50g pane di segale", "marmellata/miele", "20g burro d'arachidi"],
    ["300g patate", "200g petto di pollo/tacchino", "verdura", "20g olio EVO"]
  ]),
  friday: day([
    ["150g yogurt greco zero grassi", "60g fiocchi di mais", "20g frutta secca", "#1 frutto"],
    ["30g crackers di riso / integrali", "30g whey protein isolate"],
    ["150g pasta (integrale)", "100g mozzarella light", "20g olio EVO"],
    ["50g pane di segale", halfAvocado],
    ["200g legumi (cotti)", "200g pesce magro", "verdura", "20g olio EVO"]
  ]),
  saturday: day([
    ["200ml latte vegetale/scremato", "60g gallette", "20g crema di frutta secca", "#1 frutto/marmellata"],
    ["barretta proteica"],
    ["150g riso/farro/orzo", "100g tonno al naturale", "20g olio EVO"],
    ["30g crackers di riso / integrali", "20g frutta secca"],
    ["pasto libero"]
  ]),
  sunday: day([
    ["120-150g albume (per pancake)", "60g farina d'avena", "20g cioccolato fondente", "#1 frutto/marmellata"],
    ["30g gallette di mais/riso", "150g yogurt greco zero grassi"],
    ["300g gnocchi di patate", "100g pesce grasso", "15g olio EVO"],
    ["50g pane di segale", "marmellata/miele", "20g burro d'arachidi"],
    ["200g legumi (cotti)", "200g petto di pollo/tacchino", "verdura", "20g olio EVO"]
  ])
};

const diet = {
  schemaVersion: "1.0",
  source: {
    fileName: "Matteo Ducci 1 mese 1 massa.pdf",
    extractedAt: "2026-06-28",
    notes: "JSON standardizzato per import nella PWA Meals. Estratto dal PDF Matteo Ducci 1 mese 1 massa del 26/06/26."
      + " Alternative create usando FA sostituzione carboidrati.pdf e TABELLA SOSTITUZIONI.pdf."
  },
  person: {
    displayName: "Matteo Ducci",
    firstName: "Matteo",
    lastName: "Ducci"
  },
  plan: {
    name: "Mese 1 incremento massa muscolare",
    phases: [
      {
        id: "weeks-1-2",
        label: "Settimane 1-2",
        caloriesPerDay: "2400 cal",
        days: Object.fromEntries(dayOrder.map((key) => [key, phaseOneByDay[key]]))
      },
      {
        id: "weeks-3-4",
        label: "Settimane 3-4",
        caloriesPerDay: "2500 cal",
        days: Object.fromEntries(dayOrder.map((key) => [key, phaseTwoByDay[key]]))
      }
    ]
  },
  foods: [],
  combinations: [],
  substitutions: {
    sources: [
      "FA sostituzione carboidrati.pdf",
      "TABELLA SOSTITUZIONI.pdf"
    ],
    notes: [
      "Le alternative dei carboidrati seguono le equivalenze della tabella FitActive: 10g pasta/riso/avena = 15g pane/pasta fresca/piadina = 22g gnocchi = 37,5g patate = 25g legumi/mais.",
      "Le alternative proteine, latticini e grassi seguono la tabella sostituzioni generale, mantenendo frequenze e limiti come indicazione del piano."
    ]
  }
};

fs.writeFileSync("docs/import-matteo-ducci.json", JSON.stringify(diet, null, 2) + "\n");
