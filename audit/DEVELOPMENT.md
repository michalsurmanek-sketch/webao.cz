# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Další úkol: ověřit dokončení reportu při výpadcích zdrojů v prohlížeči.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- PR #9 byl sloučen po úspěšném CI běhu 43143912520: regrese, produkční healthcheck, prohlížečový smoke a desktopové/mobilní scénáře výpadků.
- HTML metadata nově vyžadují explicitně otevřenou a uzavřenou hlavičku. Samotný doctype, HTML fragment nebo nedokončená hlavička neprokazují úplnost; výsledek je neověřený bez vlivu na skóre.
- Konzervativní omezení: dokument s volitelně vynechanými značkami head může být platný HTML, ale tato čtečka jeho úplnost nepotvrdí, proto jej nehodnotí.
- Regresní scénáře: doctype bez hlavičky, useknutá hlavička s canonical, body fragment; existující úplný dokument zůstává podporován.
- Ověření: regresní sada a git diff --check; prohlížečové scénáře ověřuje CI PR.
- Další priorita: ověřit relativní metadata při přesměrování a použití base href; nepředpokládat, že požadovaná URL je vždy základ výsledného dokumentu.
