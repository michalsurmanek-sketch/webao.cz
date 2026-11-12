# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- XML komentáře se ignorují při rozpoznávání sitemap, extrakci loc i rozlišení urlset/indexu. Obsah CDATA se zachovává včetně řetězců připomínajících komentáře.
- Značka urlset uvnitř komentáře už nemůže vyřadit platný index; URL z komentáře nevstupují do inventáře ani fronty požadavků. Odpověď obsahující jen komentář nepotvrzuje sitemapu.
- Regrese pokrývá komentované loc, falešný typ dokumentu, neukončený komentář a zachování CDATA. Chromium integrační scénář obsahuje falešnou urlset značku v komentáři indexu a podřízenou odpověď tvořenou pouze komentářem.
- Ověření: regresní sada, syntaxe browser testu a git diff --check; CI provádí Chromium a produkční kontroly.
- Další priorita: explicitně rozlišit neúplné XML od použitelných sitemap; současná extrakce není validátor XML a může číst kompletní loc z neúplného dokumentu.
