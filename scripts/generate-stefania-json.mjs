import fs from "node:fs";

const supplements = ["#1 compressa multivitamin", "#2 compresse omega 3"];

const substitutions = {
  carbohydrates: [
    { source: "50g pasta/riso/farro/orzo/avena", targets: ["75g pane/pasta fresca/piadina", "110g gnocchi di patate", "200g patate/patate dolci", "120g legumi/mais in scatola"] },
    { source: "60g pasta/riso/farro/orzo/avena", targets: ["90g pane/pasta fresca/piadina", "140g gnocchi di patate", "250g patate/patate dolci", "150g legumi/mais in scatola"] },
    { source: "75g pane integrale", targets: ["50g pasta integrale", "50g riso/farro/orzo", "110g gnocchi di patate", "200g patate"] },
    { source: "90g pane integrale", targets: ["60g pasta integrale", "60g riso/farro/orzo", "140g gnocchi di patate", "250g patate"] }
  ],
  proteins: [
    { group: "pranzo", items: ["100g mozzarella light", "#2 uova", "200g fiocchi di latte zero grassi", "100g ricotta light", "100g tonno al naturale", "100g pesce grasso", "100g prosciutto cotto"] },
    { group: "cena", items: ["100g petto di pollo/tacchino", "100g pesce magro", "100g manzo/cavallo"] }
  ],
  snacks: [
    { items: ["150g yogurt greco zero grassi", "30g whey protein isolate", "50g fesa di tacchino", "150ml kefir/yogurt da bere", "barretta proteica"] }
  ]
};

const phaseA = {
  id: "phaseA",
  label: "Settimane 1-2",
  caloriesPerDay: "1650 cal",
  rawDays: {
    monday: {
      breakfast: ["200ml latte vegetale/scremato", "40g biscotti magri", "35g frutta secca", "#1 frutto"],
      lunch: ["60g pasta integrale", "100g mozzarella light", "15g olio EVO"],
      snack: ["20g fiocchi di mais", "150g yogurt greco zero grassi"],
      dinner: ["60g riso/farro/orzo", "100g petto di pollo/tacchino", "verdura", "20g olio EVO"]
    },
    tuesday: {
      breakfast: ["150g yogurt greco zero grassi", "40g fette biscottate integrali", "35g frutta secca", "#1 frutto/marmellata"],
      lunch: ["90g pane integrale", "#2 uova", "15g olio EVO"],
      snack: ["barretta proteica"],
      dinner: ["250g patate", "100g pesce magro", "verdura", "20g olio EVO"]
    },
    wednesday: {
      breakfast: ["200ml latte vegetale/scremato", "40g cornflakes", "35g frutta secca", "#1 frutto"],
      lunch: ["60g pasta integrale", "200g fiocchi di latte zero grassi", "15g olio EVO"],
      snack: ["20g gallette mais/riso", "30g whey protein isolate"],
      dinner: ["90g pane integrale", "100g manzo/cavallo", "verdura", "20g olio EVO"]
    },
    thursday: {
      breakfast: ["150g yogurt greco zero grassi", "40g fette biscottate integrali", "35g frutta secca", "#1 frutto/marmellata"],
      lunch: ["140g gnocchi di patate", "#2 uova", "15g olio EVO"],
      snack: ["20g fiocchi di mais", "150g yogurt greco zero grassi"],
      dinner: ["90g pane integrale", "100g petto di pollo/tacchino", "verdura", "20g olio EVO"]
    },
    friday: {
      breakfast: ["200ml latte vegetale/scremato", "40g biscotti magri", "35g frutta secca", "#1 frutto"],
      lunch: ["60g pasta integrale", "100g ricotta light", "15g olio EVO"],
      snack: ["30g pane integrale", "50g fesa di tacchino"],
      dinner: ["150g legumi cotti", "100g pesce magro", "verdura", "20g olio EVO"]
    },
    saturday: {
      breakfast: ["150g yogurt greco zero grassi", "40g fette biscottate integrali", "35g frutta secca", "#1 frutto/marmellata"],
      lunch: ["60g riso/farro/orzo", "100g tonno al naturale", "15g olio EVO"],
      snack: ["20g fiocchi di mais", "150g yogurt greco zero grassi"],
      dinner: ["pasto libero"]
    },
    sunday: {
      breakfast: ["200ml latte vegetale/scremato", "40g cornflakes", "35g frutta secca", "#1 frutto"],
      lunch: ["60g pasta integrale", "100g pesce grasso", "15g olio EVO"],
      snack: ["20g gallette mais/riso", "150ml kefir/yogurt da bere"],
      dinner: ["250g patate", "100g petto di pollo/tacchino", "verdura", "20g olio EVO"]
    }
  }
};

const phaseB = {
  id: "phaseB",
  label: "Settimane 3-4",
  caloriesPerDay: "1300 cal",
  rawDays: {
    monday: {
      breakfast: ["200ml latte vegetale/scremato", "20g biscotti magri", "#1 frutto"],
      lunch: ["50g pasta integrale", "100g mozzarella light", "15g olio EVO"],
      snack: ["20g fiocchi di mais", "150g yogurt greco zero grassi"],
      dinner: ["50g riso/farro/orzo", "100g petto di pollo/tacchino", "verdura", "20g olio EVO"]
    },
    tuesday: {
      breakfast: ["150g yogurt greco zero grassi", "20g fette biscottate integrali", "#1 frutto/marmellata"],
      lunch: ["75g pane integrale", "#2 uova", "15g olio EVO"],
      snack: ["barretta proteica"],
      dinner: ["200g patate", "100g pesce magro", "20g olio EVO"]
    },
    wednesday: {
      breakfast: ["200ml latte vegetale/scremato", "20g cornflakes", "#1 frutto"],
      lunch: ["50g pasta integrale", "200g fiocchi di latte zero grassi", "15g olio EVO"],
      snack: ["20g gallette mais/riso", "30g whey protein isolate"],
      dinner: ["50g riso/farro/orzo", "100g manzo/cavallo", "verdura", "20g olio EVO"]
    },
    thursday: {
      breakfast: ["150g yogurt greco zero grassi", "20g fette biscottate integrali", "#1 frutto/marmellata"],
      lunch: ["110g gnocchi di patate", "#2 uova", "15g olio EVO"],
      snack: ["20g fiocchi di mais", "150g yogurt greco zero grassi"],
      dinner: ["70g pane integrale", "100g petto di pollo/tacchino", "20g olio EVO"]
    },
    friday: {
      breakfast: ["200ml latte vegetale/scremato", "20g biscotti magri", "#1 frutto"],
      lunch: ["50g pasta integrale", "100g ricotta light", "15g olio EVO"],
      snack: ["30g pane integrale", "50g fesa di tacchino"],
      dinner: ["120g legumi cotti", "100g pesce magro", "verdura", "20g olio EVO"]
    },
    saturday: {
      breakfast: ["150g yogurt greco zero grassi", "20g fette biscottate integrali", "#1 frutto/marmellata"],
      lunch: ["75g pane integrale", "100g prosciutto cotto", "15g olio EVO"],
      snack: ["20g fiocchi di mais", "150g yogurt greco zero grassi"],
      dinner: ["pasto libero"]
    },
    sunday: {
      breakfast: ["200ml latte vegetale/scremato", "40g cornflakes", "35g frutta secca", "#1 frutto"],
      lunch: ["50g pasta integrale", "100g pesce grasso", "15g olio EVO"],
      snack: ["20g gallette mais/riso", "150ml kefir/yogurt da bere"],
      dinner: ["250g patate", "100g petto di pollo/tacchino", "verdura", "20g olio EVO"]
    }
  }
};

const diet = {
  schemaVersion: "1.0",
  source: {
    fileName: "Stefania Viterbo 1 mese 1 definizione.pdf",
    extractedAt: "2026-06-18",
    notes: "JSON standardizzato per import nella PWA Meals. Estratto da PDF immagine tramite lettura visiva del piano."
  },
  person: {
    displayName: "Stefania Viterbo",
    firstName: "Stefania",
    lastName: "Viterbo"
  },
  plan: {
    name: "Mese 1 definizione",
    phases: [buildPhase(phaseA), buildPhase(phaseB)]
  },
  foods: [],
  combinations: [],
  substitutions
};

fs.writeFileSync("docs/import-stefania-viterbo.json", JSON.stringify(diet, null, 2) + "\n");

function buildPhase(phase) {
  const days = Object.fromEntries(
    Object.entries(phase.rawDays).map(([dayKey, day]) => [
      dayKey,
      {
        supplements,
        meals: ["breakfast", "lunch", "snack", "dinner"].map((type) => ({
          type,
          items: day[type],
          alternatives: buildAlternatives(type, day[type], phase.id)
        }))
      }
    ])
  );

  return {
    id: phase.id,
    label: phase.label,
    caloriesPerDay: phase.caloriesPerDay,
    days
  };
}

function buildAlternatives(type, items, phaseId) {
  if (items.includes("pasto libero")) return [];
  if (type === "breakfast") return breakfastAlternatives(items);
  if (type === "snack") return snackAlternatives(items);
  if (type === "lunch") return savoryAlternatives(items, phaseId, "pranzo");
  return savoryAlternatives(items, phaseId, "cena");
}

function breakfastAlternatives(items) {
  const joined = items.join(" ");
  const carb = amountFor(joined, ["biscotti", "fette", "cornflakes"]) || "30g";
  const nuts = joined.includes("35g frutta secca") ? ["35g frutta secca"] : [];
  const fruit = joined.includes("frutto/marmellata") ? "#1 frutto/marmellata" : "#1 frutto";
  return [
    { label: "Alternativa colazione", items: ["150g yogurt greco zero grassi", `${carb} fette biscottate integrali`, ...nuts, fruit] },
    { label: "Alternativa colazione", items: ["200ml latte vegetale/scremato", `${carb} cornflakes`, ...nuts, fruit] }
  ];
}

function snackAlternatives(items) {
  const joined = items.join(" ").toLowerCase();
  if (joined.includes("barretta")) {
    return [
      { label: "Alternativa spuntino", items: ["20g gallette mais/riso", "30g whey protein isolate"] },
      { label: "Alternativa spuntino", items: ["30g pane integrale", "50g fesa di tacchino"] }
    ];
  }
  if (joined.includes("whey")) {
    return [
      { label: "Alternativa spuntino", items: ["barretta proteica"] },
      { label: "Alternativa spuntino", items: ["20g fiocchi di mais", "150g yogurt greco zero grassi"] }
    ];
  }
  if (joined.includes("fesa")) {
    return [
      { label: "Alternativa spuntino", items: ["barretta proteica"] },
      { label: "Alternativa spuntino", items: ["20g gallette mais/riso", "150ml kefir/yogurt da bere"] }
    ];
  }
  return [
    { label: "Alternativa spuntino", items: ["20g gallette mais/riso", "30g whey protein isolate"] },
    { label: "Alternativa spuntino", items: ["barretta proteica"] }
  ];
}

function savoryAlternatives(items, phaseId, labelType) {
  const joined = items.join(" ").toLowerCase();
  const oil = items.find((item) => item.toLowerCase().includes("olio")) || "15g olio EVO";
  const vegetables = items.find((item) => item.toLowerCase() === "verdura") ? ["verdura"] : [];
  const carbOptions = phaseId === "phaseA"
    ? ["60g pasta integrale", "90g pane integrale", "250g patate", "150g legumi cotti"]
    : ["50g pasta integrale", "75g pane integrale", "200g patate", "120g legumi cotti"];
  const proteinOptions = labelType === "cena"
    ? ["100g petto di pollo/tacchino", "100g pesce magro", "100g manzo/cavallo"]
    : ["100g mozzarella light", "#2 uova", "100g ricotta light", "100g pesce grasso"];

  const carb = carbOptions.find((option) => !joined.includes(option.split(" ").slice(1).join(" ").toLowerCase())) || carbOptions[0];
  const protein = proteinOptions.find((option) => !joined.includes(option.split(" ").slice(1).join(" ").toLowerCase())) || proteinOptions[0];

  return [
    { label: `Alternativa ${labelType}`, items: [carb, protein, ...vegetables, oil] },
    { label: `Alternativa ${labelType}`, items: [carbOptions[(carbOptions.indexOf(carb) + 1) % carbOptions.length], proteinOptions[(proteinOptions.indexOf(protein) + 1) % proteinOptions.length], ...vegetables, oil] }
  ];
}

function amountFor(text, keywords) {
  for (const keyword of keywords) {
    const match = text.match(new RegExp(`(\\d+g)\\s+[^,]*${keyword}`, "i"));
    if (match) return match[1];
  }
  return null;
}
