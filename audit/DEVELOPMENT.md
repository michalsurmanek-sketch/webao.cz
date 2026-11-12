# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Validace a extrakce XML používají společný parser s omezenou cache posledního dokumentu. Opakované čtení stejného zdroje znovu nespouští DOMParser; paměť uchovává nejvýše jeden pár zdroj/dokument, včetně neplatného výsledku.
- Chromium měří počet volání parseru při validaci a dvou extrakcích: očekává právě jedno. Stávající scénáře nadále ověřují neúplné XML, namespace, entity a ignorování obrázků.
- Ověření: místní regrese, syntaxe testu, diff kontrola; nativní Chromium a produkční kontroly v CI.
- Další priorita: prověřit, zda čtečkové textové sitemapy nesměšují anotace čtečky s vlastními URL.
