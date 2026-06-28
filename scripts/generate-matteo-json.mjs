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

function day(items) {
  return {
    notes: dayNotes,
    meals: [
      { type: "breakfast", title: "Pasto 1", items: items[0] },
      { type: "snack", title: "Pasto 2", items: items[1] },
      { type: "lunch", title: "Pasto 3", items: items[2] },
      { type: "snack", title: "Pasto 4", items: items[3] },
      { type: "dinner", title: "Pasto 5", items: items[4] }
    ].filter((meal) => meal.items.length > 0)
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
  substitutions: {}
};

fs.writeFileSync("docs/import-matteo-ducci.json", JSON.stringify(diet, null, 2) + "\n");
