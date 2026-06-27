# Prompt offline per Codex: PDF dieta -> JSON standard

Usa questo prompt quando vuoi trasformare un PDF in un JSON caricabile dalla SPA.

```text
Leggi il PDF della dieta e produci solo JSON valido conforme a docs/diet-json.schema.json.

Regole:
- schemaVersion deve essere "1.0".
- person.displayName deve derivare dal nome del file PDF quando disponibile.
- Usa i giorni: monday, tuesday, wednesday, thursday, friday, saturday, sunday.
- Usa i tipi pasto: breakfast, lunch, snack, dinner.
- Non inventare macro se non sono nel PDF.
- Mantieni rawText con il testo originale del PDF per ogni alimento.
- Quando possibile, normalizza anche name, quantity, unit e category.
- Inserisci le alternative esplicite del PDF in substitutions o alternatives.
- Se un pasto e vuoto nel PDF, omettilo.
- Rispondi solo con JSON, senza Markdown.
```
