const FOOD_IMAGE_RULES = [
  { exact: ["marmellata", "marmellata/miele"], keys: ["marmellata"], src: "/foods/matteo/marmellata.png" },
  { exact: ["frutto", "#1 frutto"], src: "/foods/stefania/frutto-marmellata.jpg" },
  { keys: ["biscotti magri"], src: "/foods/stefania/biscotti-magri.jpg" },
  { keys: ["fette biscottate"], src: "/foods/stefania/fette-biscottate.jpg" },
  { keys: ["pasta integrale", "pasta (integrale)"], src: "/foods/stefania/pasta-integrale.jpg" },
  { keys: ["pane di qualsiasi cereale"], src: "/foods/matteo/pane-qualsiasi-cereale.png" },
  { keys: ["pane integrale", "pane (integrale)"], src: "/foods/stefania/pane-integrale.jpg" },
  { keys: ["mozzarella"], src: "/foods/stefania/mozzarella-light.jpg" },
  { keys: ["ricotta", "fiocchi di latte"], src: "/foods/stefania/ricotta-fiocchi-latte.jpg" },
  { keys: ["gnocchi"], src: "/foods/matteo/gnocchi-patate.png" },
  { keys: ["patate/patate dolci", "patate dolci", "patate"], src: "/foods/matteo/patate-patate-dolci.png" },
  { keys: ["legumi"], src: "/foods/stefania/legumi.jpg" },
  { keys: ["pesce magro", "pesce grasso", "pesce"], src: "/foods/stefania/pesce.jpg" },
  { keys: ["prosciutto cotto"], src: "/foods/stefania/prosciutto-cotto.jpg" },
  { keys: ["barretta proteica"], src: "/foods/stefania/barretta-proteica.jpg" },
  { keys: ["pasto libero"], src: "/foods/stefania/pasto-libero.jpg" },
  { keys: ["nasello", "merluzzo"], src: "/foods/stefania/pesce.jpg" },
  { keys: ["mele", "frutto"], src: "/foods/stefania/frutto-marmellata.jpg" },
  { keys: ["avocado"], src: "/foods/davide/avocado.jpg" },
  { keys: ["uova", "uovo"], src: "/foods/davide/uova.jpg" },
  { keys: ["albume"], src: "/foods/davide/albume.jpg" },
  { keys: ["gallette", "wasa"], src: "/foods/davide/gallette.jpg" },
  { keys: ["cereali", "cornflakes", "fiocchi di mais"], src: "/foods/davide/cereali.jpg" },
  { keys: ["farina d'avena", "avena/pane"], src: "/foods/davide/avena-pane.jpg" },
  { keys: ["pane tostato"], src: "/foods/davide/pane-tostato.jpg" },
  { keys: ["yogurt greco", "kefir", "yogurt da bere"], src: "/foods/davide/yogurt-greco.jpg" },
  { keys: ["latte vegetale"], src: "/foods/davide/latte-vegetale.jpg" },
  { keys: ["essenziali", "aminoacidi essenziali", "eaa"], src: "/foods/davide/essenziali.png" },
  { keys: ["proteine", "whey"], src: "/foods/davide/proteine.jpg" },
  { keys: ["banana"], src: "/foods/davide/banana.jpg" },
  { keys: ["ciclodestrine", "ciclodestrina", "cyclic dextrin"], src: "/foods/davide/ciclodestrine.png" },
  { keys: ["crema di riso", "cream of rice", "farina di riso"], src: "/foods/davide/crema-di-riso.png" },
  { keys: ["riso/cous", "riso", "cous cous"], src: "/foods/davide/riso-couscous.jpg" },
  { keys: ["tacchino", "pollo"], src: "/foods/davide/tacchino-pollo.jpg" },
  { keys: ["tonno"], src: "/foods/davide/tonno.jpg" },
  { keys: ["manzo", "salmone"], src: "/foods/davide/manzo-salmone.jpg" },
  { keys: ["olio"], src: "/foods/davide/olio.jpg" },
  { keys: ["sale", "sodio"], src: "/foods/davide/sale.png" },
  { keys: ["verdure", "verdura"], src: "/foods/davide/verdure.jpg" },
  { keys: ["mirtilli"], src: "/foods/davide/mirtilli.jpg" },
  { keys: ["cannella"], src: "/foods/davide/cannella.jpg" },
  { keys: ["burro d'arachidi", "burro arachidi", "frutta secca"], src: "/foods/davide/burro-arachidi-frutta-secca.jpg" },
  { keys: ["cioccolato fondente"], src: "/foods/matteo/cioccolato-fondente.png" },
  { keys: ["pane di segale"], src: "/foods/matteo/pane-segale.png" },
  { keys: ["fiocchi d'avena"], src: "/foods/matteo/fiocchi-avena.png" }
];

export function getFoodImage(label) {
  const normalized = String(label || "").toLowerCase();
  const clean = normalized.replace(/^\s*(?:#?\d+(?:[,.]\d+)?\s*(?:g|ml)?|#\s*\d+)\s+/i, "").trim();
  const match = FOOD_IMAGE_RULES.find((rule) =>
    rule.exact?.includes(clean) || rule.keys?.some((key) => normalized.includes(key))
  );
  return match?.src || null;
}
