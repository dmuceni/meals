import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { requireSupabase, supabase } from "./lib/supabase.js";
import { apiFetch } from "./lib/api.js";
import { DAYS, DAY_ORDER, MEAL_TYPES } from "./lib/constants.js";
import { buildShoppingList, formatAmount, getCurrentPhase, getMealsForDay, normalizeDiet, parseShoppingItem, validateDietJson } from "./lib/diet.js";
import { DEMO_DIET } from "./lib/demoDiet.js";
import { getFoodImage } from "./lib/foodImages.js";
import "./styles.css";

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const client = requireSupabase();
      if (mode === "login") {
        const { error: authError } = await client.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      }

      if (mode === "register") {
        const { error: authError } = await client.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } }
        });
        if (authError) throw authError;
        setMessage("Registrazione creata. Controlla la mail se Supabase richiede conferma.");
      }

      if (mode === "reset") {
        const redirectTo = `${window.location.origin}/`;
        const { error: authError } = await client.auth.resetPasswordForEmail(email, { redirectTo });
        if (authError) throw authError;
        setMessage("Ti ho inviato il link per reimpostare la password.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Piano alimentare</p>
        <h1>{mode === "login" ? "Accedi" : mode === "register" ? "Registrati" : "Reset password"}</h1>
        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <label>
              Nome visualizzato
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Sonia Mannarino" />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          {mode !== "reset" && (
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
            </label>
          )}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Attendi..." : mode === "login" ? "Entra" : mode === "register" ? "Crea account" : "Invia reset"}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-message">{message}</p>}
        <div className="auth-switcher">
          <button type="button" onClick={() => setMode("login")}>Login</button>
          <button type="button" onClick={() => setMode("register")}>Registrazione</button>
          <button type="button" onClick={() => setMode("reset")}>Password reset</button>
        </div>
      </section>
    </main>
  );
}

function PasswordRecoveryScreen({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);
    try {
      const client = requireSupabase();
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage("Password aggiornata. Ora puoi accedere con la nuova password.");
      clearPasswordRecoveryUrl();
      await new Promise((resolve) => setTimeout(resolve, 900));
      await client.auth.signOut();
      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Reset password</p>
        <h1>Imposta nuova password</h1>
        <form onSubmit={submit} className="auth-form">
          <label>
            Nuova password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
          </label>
          <label>
            Conferma password
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={6} />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Salvataggio..." : "Aggiorna password"}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-message">{message}</p>}
      </section>
    </main>
  );
}

function AppShell({ session }) {
  const [profile, setProfile] = useState(null);
  const [diet, setDiet] = useState(null);
  const [phaseId, setPhaseId] = useState("");
  const [dayKey, setDayKey] = useState(DAYS[new Date().getDay()].key);
  const [view, setView] = useState("menu");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [me, activeDiet] = await Promise.all([
        apiFetch("/api/me", session),
        apiFetch("/api/diet", session)
      ]);
      setProfile(me.profile);
      if (activeDiet.diet?.diet_json) {
        const nextDiet = normalizeDiet(activeDiet.diet.diet_json);
        setDiet(nextDiet);
        setPhaseId(nextDiet.plan.phases[0]?.id || "");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const phase = useMemo(() => getCurrentPhase(diet, phaseId), [diet, phaseId]);
  const meals = useMemo(() => getMealsForDay(phase, dayKey), [phase, dayKey]);
  const shopping = useMemo(() => buildShoppingList(phase), [phase]);
  const displayName = diet?.person?.displayName || profile?.display_name || session.user.email;

  return (
    <>
      <header className="app-header">
        <div>
          <p className="eyebrow">Piano alimentare</p>
          <h1>{displayName}</h1>
        </div>
        <button className="ghost-button" type="button" onClick={() => supabase.auth.signOut()}>Esci</button>
      </header>

      <main>
        {loading && <div className="empty-state">Caricamento...</div>}
        {error && <div className="empty-state">{error}</div>}

        {!loading && !diet && <ImportDiet session={session} onImported={loadData} />}

        {diet && (
          <>
            <section className="controls" aria-label="Selezione piano">
              <div className="segmented" role="tablist" aria-label="Fase">
                {diet.plan.phases.map((item) => (
                  <button key={item.id} type="button" className={item.id === phase?.id ? "active" : ""} onClick={() => setPhaseId(item.id)}>
                    {item.label}
                  </button>
                ))}
              </div>
              {view === "menu" && (
                <div className="day-strip" aria-label="Giorni della settimana">
                  {DAY_ORDER.map((key) => {
                    const day = DAYS.find((item) => item.key === key);
                    return (
                      <button key={key} type="button" className={dayKey === key ? "active" : ""} onClick={() => setDayKey(key)}>
                        {day.short}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {view === "menu" ? (
              <MenuView phase={phase} dayKey={dayKey} meals={meals} />
            ) : (
              <ShoppingView phase={phase} shopping={shopping} />
            )}
          </>
        )}
      </main>

      {diet && (
        <nav className="floating-toolbar" aria-label="Navigazione principale">
          <button type="button" className={view === "menu" ? "active" : ""} aria-pressed={view === "menu"} onClick={() => setView("menu")}>
            <span className="toolbar-icon" aria-hidden="true">☰</span>
            Menu
          </button>
          <button type="button" className={view === "shopping" ? "active" : ""} aria-pressed={view === "shopping"} onClick={() => setView("shopping")}>
            <span className="toolbar-icon" aria-hidden="true">✓</span>
            Spesa
          </button>
        </nav>
      )}
    </>
  );
}

function MenuView({ phase, dayKey, meals }) {
  const day = DAYS.find((item) => item.key === dayKey);
  return (
    <section className="app-view">
      <section className="summary-band">
        <div>
          <p className="eyebrow">Giornata</p>
          <h2>{day.label} · {phase?.caloriesPerDay || phase?.calories || ""}</h2>
        </div>
        <div className="summary-stat">
          <span>{meals.length}</span>
          <small>pasti</small>
        </div>
      </section>
      <section className="meal-list" aria-live="polite">
        {meals.length === 0 && <div className="empty-state">Nessun pasto inserito per questa giornata.</div>}
        {meals.map((meal, index) => <MealCard key={`${meal.type}-${index}`} meal={meal} />)}
      </section>
    </section>
  );
}

function MealCard({ meal }) {
  const [active, setActive] = useState(0);
  const swipeRef = useRef(null);
  const slides = [
    { items: meal.items || [], note: "Previsto dal piano." },
    ...(meal.alternatives || []).map((alt) => ({
      items: alt.items || alt,
      note: alt.note || "Alternativa equivalente."
    }))
  ];
  const type = meal.type || "lunch";
  const currentSlide = slides[active] || slides[0];
  const nutrition = estimateMealNutrition(currentSlide.items);

  function move(direction) {
    setActive((current) => (current + direction + slides.length) % slides.length);
  }

  function beginSwipe(event) {
    if (slides.length < 2 || event.target.closest?.("button, input, a, label")) return;
    swipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function trackSwipe(event) {
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== event.pointerId) return;
    swipe.currentX = event.clientX;
    swipe.currentY = event.clientY;
  }

  function finishSwipe(event) {
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== event.pointerId) return;
    swipeRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;
    const isHorizontalSwipe = Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15;
    if (!isHorizontalSwipe) return;

    move(deltaX < 0 ? 1 : -1);
  }

  function cancelSwipe(event) {
    if (swipeRef.current?.pointerId !== event.pointerId) return;
    swipeRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  return (
    <article
      className={`meal-card meal-card-${type}${slides.length > 1 ? " swipeable" : ""}`}
      onPointerDown={beginSwipe}
      onPointerMove={trackSwipe}
      onPointerUp={finishSwipe}
      onPointerCancel={cancelSwipe}
    >
      <header className="meal-card-header">
        <div className="equivalence-title">
          <span aria-hidden="true" />
          <h3>{MEAL_TYPES[type] || meal.title || "Pasto"}</h3>
          <span aria-hidden="true" />
        </div>
        <div className="equivalence-mark" aria-hidden="true">
          <span />
        </div>
        <div className="meal-card-context">
          <span>{currentSlide.note}</span>
        </div>
      </header>
      <div className="meal-body">
        <div className="slider">
          <div className="slides">
            <div className="slide" key={active}>
              <ul className="ingredient-list">
                {currentSlide.items.map((item, index) => (
                  <IngredientRow key={index} item={item} mealType={type} />
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="card-actions">
          <button type="button" className="icon-button prev" aria-label="Alternativa precedente" onClick={() => move(-1)}>‹</button>
          <div className="dots" aria-hidden="true">
            {slides.map((_, index) => <span key={index} className={index === active ? "active" : ""} />)}
          </div>
          <button type="button" className="icon-button next" aria-label="Alternativa successiva" onClick={() => move(1)}>›</button>
        </div>
      </div>
      <footer className="meal-estimate">
        <div className="estimate-title">Totale stimato</div>
        <div className="estimate-macro"><span>Kcal</span><strong>{nutrition.kcal}</strong></div>
        <div className="estimate-macro"><span>Proteine</span><strong>{nutrition.protein} g</strong></div>
        <div className="estimate-macro"><span>Carboidrati</span><strong>{nutrition.carbs} g</strong></div>
        <div className="estimate-macro"><span>Grassi</span><strong>{nutrition.fats} g</strong></div>
      </footer>
    </article>
  );
}

function IngredientRow({ item, mealType }) {
  const parsed = parseIngredient(item);
  const category = parsed.category || mealType;
  const image = getFoodImage(`${parsed.raw} ${parsed.name} ${parsed.detail}`);
  return (
    <li className="ingredient-row">
      {image ? (
        <span className="ingredient-photo" aria-hidden="true">
          <img src={image} alt="" loading="lazy" />
        </span>
      ) : (
        <span className={`ingredient-visual ${category}`} aria-hidden="true" />
      )}
      <span className="ingredient-copy">
        <strong>{parsed.name}</strong>
        {parsed.detail && <span>{parsed.detail}</span>}
        <small className="ingredient-amount">
          <strong>{parsed.amount}</strong>
          {parsed.unit && <span>{parsed.unit}</span>}
        </small>
      </span>
    </li>
  );
}

function parseIngredient(rawItem) {
  const raw = typeof rawItem === "string" ? rawItem : rawItem.rawText || `${rawItem.quantity || ""}${rawItem.unit || ""} ${rawItem.name || ""}`.trim();
  const parsed = parseShoppingItem(rawItem);
  const fallback = { label: raw || "Alimento", quantity: 1, unit: "voce", category: "other" };
  const item = parsed || fallback;
  const label = cleanIngredientLabel(item.label || raw);
  const { name, detail } = splitIngredientLabel(label);
  const badge = splitBadgeAmount(item, raw);

  return {
    raw,
    name,
    detail,
    amount: badge.amount,
    unit: badge.unit,
    category: ingredientVisualCategory(item.category, label)
  };
}

function cleanIngredientLabel(label) {
  return label
    .replace(/\bEVO\b/g, "evo")
    .replace(/\bquanto basta\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitIngredientLabel(label) {
  const [primary, ...rest] = label.split("/");
  const words = primary.trim().split(" ");
  const shortName = words.length > 3 ? words.slice(0, 3).join(" ") : primary.trim();
  const detailParts = [
    words.length > 3 ? words.slice(3).join(" ") : "",
    rest.join("/")
  ].filter(Boolean);

  return {
    name: toTitleCase(shortName || label),
    detail: detailParts.join(" / ").trim()
  };
}

function splitBadgeAmount(item, raw) {
  if (item.unit === "voce") {
    if (/quanto basta/i.test(raw)) return { amount: "qb", unit: "" };
    return { amount: "1", unit: "voce" };
  }

  if (item.unit === "pz") {
    const unit = item.label?.split(" ")[0] || "pz";
    return { amount: formatQuantity(item.quantity), unit };
  }

  return {
    amount: formatQuantity(item.quantity),
    unit: item.unit
  };
}

function ingredientVisualCategory(category, label) {
  const lower = label.toLowerCase();
  if (lower.includes("olio") || lower.includes("burro") || lower.includes("frutta secca")) return "fats";
  if (lower.includes("uova") || lower.includes("albume") || lower.includes("proteine")) return "proteins";
  return category || "other";
}

function formatQuantity(quantity) {
  const numeric = Number(quantity);
  if (!Number.isFinite(numeric)) return String(quantity || 1);
  return Number.isInteger(numeric) ? String(numeric) : String(Number(numeric.toFixed(1)));
}

function toTitleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function estimateMealNutrition(items) {
  const totals = items.reduce((acc, rawItem) => {
    const parsed = parseShoppingItem(rawItem);
    if (!parsed) return acc;
    const macro = estimateItemNutrition(parsed);
    acc.kcal += macro.kcal;
    acc.protein += macro.protein;
    acc.carbs += macro.carbs;
    acc.fats += macro.fats;
    return acc;
  }, { kcal: 0, protein: 0, carbs: 0, fats: 0 });

  return {
    kcal: Math.round(totals.kcal),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fats: Math.round(totals.fats)
  };
}

function estimateItemNutrition(item) {
  const label = item.label.toLowerCase();
  const quantity = Number(item.quantity) || 1;
  const grams = item.unit === "ml" ? quantity : item.unit === "g" ? quantity : 0;
  const per100 = nutritionProfile(label);

  if (item.unit === "pz") {
    if (label.includes("uova")) return multiplyMacro({ kcal: 70, protein: 6, carbs: 0, fats: 5 }, quantity);
    if (label.includes("banana")) return multiplyMacro({ kcal: 100, protein: 1, carbs: 23, fats: 0 }, quantity);
    return multiplyMacro({ kcal: 80, protein: 1, carbs: 18, fats: 0 }, quantity);
  }

  if (!grams || !per100) return { kcal: 0, protein: 0, carbs: 0, fats: 0 };
  return multiplyMacro(per100, grams / 100);
}

function nutritionProfile(label) {
  if (label.includes("olio")) return { kcal: 900, protein: 0, carbs: 0, fats: 100 };
  if (label.includes("burro") || label.includes("frutta secca")) return { kcal: 610, protein: 20, carbs: 16, fats: 52 };
  if (label.includes("albume")) return { kcal: 52, protein: 11, carbs: 1, fats: 0 };
  if (label.includes("proteine") || label.includes("whey")) return { kcal: 370, protein: 85, carbs: 3, fats: 2 };
  if (label.includes("yogurt greco")) return { kcal: 62, protein: 10, carbs: 4, fats: 0 };
  if (label.includes("latte") || label.includes("bevanda")) return { kcal: 40, protein: 2, carbs: 4, fats: 1 };
  if (["pasta", "riso", "farro", "orzo", "cous", "pane", "avena", "cereali", "cornflakes", "biscotti", "gallette", "fette", "wasa"].some((word) => label.includes(word))) return { kcal: 360, protein: 9, carbs: 74, fats: 2 };
  if (label.includes("gnocchi") || label.includes("patate")) return { kcal: 90, protein: 2, carbs: 20, fats: 0 };
  if (label.includes("legumi")) return { kcal: 110, protein: 7, carbs: 18, fats: 1 };
  if (["pollo", "tacchino", "tonno", "pesce", "manzo", "cavallo", "salmone", "fesa", "prosciutto"].some((word) => label.includes(word))) return { kcal: 145, protein: 25, carbs: 0, fats: 5 };
  if (["mozzarella", "ricotta", "fiocchi"].some((word) => label.includes(word))) return { kcal: 150, protein: 13, carbs: 3, fats: 9 };
  if (label.includes("mirtilli")) return { kcal: 57, protein: 1, carbs: 14, fats: 0 };
  return null;
}

function multiplyMacro(macro, factor) {
  return {
    kcal: macro.kcal * factor,
    protein: macro.protein * factor,
    carbs: macro.carbs * factor,
    fats: macro.fats * factor
  };
}

function ShoppingView({ phase, shopping }) {
  const total = shopping.reduce((count, category) => count + category.items.length, 0);
  return (
    <section className="app-view shopping-section" aria-labelledby="shoppingTitle">
      <div className="shopping-heading">
        <div>
          <p className="eyebrow">Supermercato</p>
          <h2 id="shoppingTitle">Lista della spesa</h2>
        </div>
        <div className="shopping-meta">
          <span>{phase?.label} · lun-dom</span>
          <small>{total} alimenti</small>
        </div>
      </div>
      <div className="shopping-grid">
        {shopping.map((category) => (
          category.items.length > 0 && (
            <section className="shopping-category" key={category.key}>
              <h3>{category.label}</h3>
              <ul className="shopping-items">
                {category.items.map((item) => (
                  <ShoppingItem key={`${item.unit}-${item.label}`} item={item} />
                ))}
              </ul>
            </section>
          )
        ))}
      </div>
    </section>
  );
}

function ShoppingItem({ item }) {
  const [checked, setChecked] = useState(false);
  const image = getFoodImage(item.label);
  const category = ingredientVisualCategory(item.category, item.label);

  return (
    <li className={checked ? "checked" : ""}>
      <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
      {image ? (
        <span className="shopping-photo" aria-hidden="true">
          <img src={image} alt="" loading="lazy" />
        </span>
      ) : (
        <span className={`ingredient-visual shopping-visual ${category}`} aria-hidden="true" />
      )}
      <span className="shopping-copy">
        <span className="shopping-name">{item.label}</span>
        <span className="shopping-amount">{formatAmount(item)}</span>
      </span>
    </li>
  );
}

function ImportDiet({ session, onImported }) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setStatus("Lettura JSON...");
    try {
      const json = JSON.parse(await file.text());
      const errors = validateDietJson(json);
      if (errors.length) throw new Error(errors.join(" "));
      setStatus("Caricamento nel database...");
      await apiFetch("/api/diet", session, {
        method: "POST",
        body: JSON.stringify({ diet: json })
      });
      setStatus("Dieta caricata.");
      await onImported();
    } catch (err) {
      setError(err.message);
      setStatus("");
    }
  }

  return (
    <section className="import-panel">
      <p className="eyebrow">Import dieta</p>
      <h2>Carica il JSON standard</h2>
      <p>Genera offline il JSON con Codex a partire dal PDF, poi caricalo qui per associarlo al tuo utente.</p>
      <label className="file-drop">
        <input type="file" accept="application/json,.json" onChange={onFileChange} />
        Seleziona JSON dieta
      </label>
      {status && <p className="form-message">{status}</p>}
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}

function Root() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations?.().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js");
  }, []);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    const hasRecoveryToken = isPasswordRecoveryUrl();
    if (hasRecoveryToken) setPasswordRecovery(true);

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
      }
      if (event === "SIGNED_OUT") {
        setPasswordRecovery(false);
      }
      setSession(nextSession);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (hasRecoveryToken && data.session) setPasswordRecovery(true);
      setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!ready) return <main><div className="empty-state">Avvio...</div></main>;
  if (!supabase) {
    return <DemoShell />;
  }
  if (passwordRecovery) {
    return <PasswordRecoveryScreen onComplete={() => setPasswordRecovery(false)} />;
  }
  return session ? <AppShell session={session} /> : <AuthScreen />;
}

function isPasswordRecoveryUrl() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return query.get("type") === "recovery" || hash.get("type") === "recovery";
}

function clearPasswordRecoveryUrl() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function DemoShell() {
  const [phaseId, setPhaseId] = useState("phaseA");
  const [dayKey, setDayKey] = useState(DAYS[new Date().getDay()].key);
  const [view, setView] = useState("menu");
  const diet = useMemo(() => normalizeDiet(DEMO_DIET), []);
  const phase = useMemo(() => getCurrentPhase(diet, phaseId), [diet, phaseId]);
  const meals = useMemo(() => getMealsForDay(phase, dayKey), [phase, dayKey]);
  const shopping = useMemo(() => buildShoppingList(phase), [phase]);

  return (
    <>
      <header className="app-header">
        <div>
          <p className="eyebrow">Demo locale</p>
          <h1>{diet.person.displayName}</h1>
        </div>
        <span className="demo-pill">No auth</span>
      </header>
      <main>
        <div className="demo-banner">Modalita demo: configura Supabase/Neon per login, import JSON e multi utente reale.</div>
        <section className="controls" aria-label="Selezione piano">
          <div className="segmented" role="tablist" aria-label="Fase">
            {diet.plan.phases.map((item) => (
              <button key={item.id} type="button" className={item.id === phase?.id ? "active" : ""} onClick={() => setPhaseId(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          {view === "menu" && (
            <div className="day-strip" aria-label="Giorni della settimana">
              {DAY_ORDER.map((key) => {
                const day = DAYS.find((item) => item.key === key);
                return (
                  <button key={key} type="button" className={dayKey === key ? "active" : ""} onClick={() => setDayKey(key)}>
                    {day.short}
                  </button>
                );
              })}
            </div>
          )}
        </section>
        {view === "menu" ? (
          <MenuView phase={phase} dayKey={dayKey} meals={meals} />
        ) : (
          <ShoppingView phase={phase} shopping={shopping} />
        )}
      </main>
      <nav className="floating-toolbar" aria-label="Navigazione principale">
        <button type="button" className={view === "menu" ? "active" : ""} aria-pressed={view === "menu"} onClick={() => setView("menu")}>
          <span className="toolbar-icon" aria-hidden="true">☰</span>
          Menu
        </button>
        <button type="button" className={view === "shopping" ? "active" : ""} aria-pressed={view === "shopping"} onClick={() => setView("shopping")}>
          <span className="toolbar-icon" aria-hidden="true">✓</span>
          Spesa
        </button>
      </nav>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
