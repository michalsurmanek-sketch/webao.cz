# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Canonical a hreflang relativní cíle se porovnávají vůči prvnímu base[href] v hlavičce, pokud je přítomný. Dříve ignorovaný základ mohl vyvolat falešný konflikt se stejným absolutním cílem.
- Regrese ověřuje relativní i externí absolutní base, stejné cíle bez hypotézy a skutečně odlišné cíle s hypotézou. Signály zůstávají bez dopadu na skóre.
- Ověření: regresní sada a git diff --check; CI PR zahrnuje produkční healthcheck a prohlížečové testy.
- PR #9 a #10 jsou sloučené, jejich CI včetně prohlížečových scénářů prošlo. Ověřování reportu při výpadcích je dokončeno.
- Další úkol: cílová URL po přesměrování není spolehlivě známá z HTML čtečky; ověřit zdroj této informace před vyhodnocením relativních cílů po redirectu.
