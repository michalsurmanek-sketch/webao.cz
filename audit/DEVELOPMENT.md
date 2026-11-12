# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Textové URL se extrahují jen za Markdown Content, pokud je přítomna čtečková obálka. URL Source již nemůže potvrdit prázdnou sitemapu ani se přidat mezi stránky nebo indexy.
- Chromium pokrývá prázdnou obálku, skutečnou stránku a skutečný child index s ignorováním adresy zdroje.
- Ověření: místní regrese, syntaxe, diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: prověřit falešné XML značky v čtečkových anotacích před Markdown Content.
