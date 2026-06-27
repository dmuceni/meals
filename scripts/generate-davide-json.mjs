import fs from "node:fs";

const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const breakfastSupplements = ["1g vit C 1000", "2mg vit D", "1 Omega 3", "2 caps vit K2", "1 multivit"];
const lunchSupplements = ["1mg vit D", "1 Omega 3", "200mg cardo mariano"];
const dinnerSupplements = ["1mg vit D", "1 Omega 3", "1 multivitaminico", "200mg cardo mariano"];
const preBedSupplements = ["2 ZMA"];

const dailyMeals = [
  {
    type: "breakfast",
    title: "Colazione",
    supplements: breakfastSupplements,
    items: ["2 uova", "200g albume", "70g cereali/gallette riso/mais"],
    alternatives: [
      {
        label: "Alternativa colazione",
        items: ["250g yogurt greco", "10g burro d'arachidi/frutta secca", "70g cereali/gallette riso/mais"]
      },
      {
        label: "Alternativa colazione",
        items: ["250ml latte vegetale", "30g proteine iso", "10g burro d'arachidi/frutta secca", "100g farina d'avena/pane tostato"]
      },
      {
        label: "Alternativa colazione",
        items: ["25g proteine idrolizzate", "10g burro d'arachidi/frutta secca", "100g farina d'avena/pane tostato"]
      }
    ]
  },
  {
    type: "snack",
    title: "Spuntino",
    items: ["250g yogurt greco", "#1 banana"],
    alternatives: [
      {
        label: "Alternativa spuntino",
        items: ["30g proteine idrolizzate", "#1 banana"]
      }
    ]
  },
  {
    type: "lunch",
    title: "Pranzo",
    supplements: lunchSupplements,
    items: ["50g riso/cous cous", "120g tacchino/pollo", "10g olio", "verdure quanto basta"],
    alternatives: [
      {
        label: "Alternativa pranzo",
        items: ["70g pane tostato", "100g tonno al naturale", "10g olio", "verdure quanto basta"]
      },
      {
        label: "Alternativa pranzo",
        items: ["50g riso/cous cous", "120g manzo/salmone", "verdure quanto basta"],
        note: "Max 2 volte alla settimana; usa 10g in meno di olio."
      }
    ]
  },
  {
    type: "dinner",
    title: "Cena",
    supplements: dinnerSupplements,
    items: ["50g riso/cous cous", "120g tacchino/pollo", "10g olio"],
    alternatives: [
      {
        label: "Alternativa cena",
        items: ["70g pane tostato", "100g tonno al naturale", "10g olio"]
      },
      {
        label: "Alternativa cena",
        items: ["50g riso/cous cous", "150g manzo/salmone", "10g olio"],
        note: "Max 2 volte alla settimana."
      }
    ]
  },
  {
    type: "snack",
    title: "Pre nanna",
    supplements: preBedSupplements,
    items: ["150g yogurt greco con dolcificante", "20g mirtilli", "cannella"],
    alternatives: []
  }
];

const days = Object.fromEntries(
  dayOrder.map((day) => [
    day,
    {
      notes: [
        "Tra un pasto e l'altro fai in modo che passino almeno 3 ore.",
        "3 litri d'acqua.",
        "3g totali di sale nei pasti principali."
      ],
      meals: dailyMeals
    }
  ])
);

const diet = {
  schemaVersion: "1.0",
  source: {
    fileName: "CONSIGLI ALIMENTARI FREE 4 DAVIDE MUCENI.pdf",
    extractedAt: "2026-06-18",
    notes: "JSON standardizzato per import nella PWA Meals. Il PDF contiene uno schema giornaliero con opzioni equivalenti, ripetuto su tutti i giorni della settimana."
  },
  person: {
    displayName: "Davide Muceni",
    firstName: "Davide",
    lastName: "Muceni"
  },
  plan: {
    name: "Consigli alimentari 4",
    phases: [
      {
        id: "daily-template",
        label: "Schema giornaliero",
        caloriesPerDay: "2050 kcal circa",
        macros: {
          proteins: "178g",
          carbohydrates: "200g",
          fats: "60g"
        },
        days
      }
    ]
  },
  foods: [],
  combinations: [
    {
      name: "Colazione - proteine",
      category: "breakfast",
      items: [
        ["2 uova", "200g albume"],
        ["250g yogurt greco", "10g burro d'arachidi/frutta secca"],
        ["250ml latte vegetale", "30g proteine iso", "10g burro d'arachidi/frutta secca"],
        ["25g proteine idrolizzate", "10g burro d'arachidi/frutta secca"]
      ]
    },
    {
      name: "Colazione - carboidrati",
      category: "breakfast",
      items: [
        ["70g cereali/gallette riso/mais"],
        ["100g farina d'avena/pane tostato"]
      ]
    },
    {
      name: "Pranzo e cena - carboidrati",
      category: "carbs",
      items: [
        ["50g riso/cous cous"],
        ["70g pane tostato"]
      ]
    },
    {
      name: "Pranzo - proteine",
      category: "proteins",
      items: [
        ["120g tacchino/pollo"],
        ["100g tonno al naturale"],
        ["120g manzo/salmone"]
      ]
    },
    {
      name: "Cena - proteine",
      category: "proteins",
      items: [
        ["120g tacchino/pollo"],
        ["100g tonno al naturale"],
        ["150g manzo/salmone"]
      ]
    }
  ],
  substitutions: {
    breakfastProteins: [
      { items: ["2 uova + 200g albume", "250g yogurt greco + 10g burro d'arachidi/frutta secca", "250ml latte vegetale + 30g proteine iso + 10g burro d'arachidi/frutta secca", "25g proteine idrolizzate + 10g burro d'arachidi/frutta secca"] }
    ],
    breakfastCarbs: [
      { items: ["70g cereali/gallette riso/mais", "100g farina d'avena/pane tostato"] }
    ],
    mainMealCarbs: [
      { items: ["50g riso/cous cous", "70g pane tostato"] }
    ],
    lunchProteins: [
      { items: ["120g tacchino/pollo", "100g tonno al naturale", "120g manzo/salmone max 2 volte alla settimana con 10g in meno di olio"] }
    ],
    dinnerProteins: [
      { items: ["120g tacchino/pollo", "100g tonno al naturale", "150g manzo/salmone max 2 volte alla settimana"] }
    ],
    snacks: [
      { items: ["250g yogurt greco", "30g proteine idrolizzate"] }
    ]
  }
};

fs.writeFileSync("docs/import-davide-muceni.json", JSON.stringify(diet, null, 2) + "\n");
