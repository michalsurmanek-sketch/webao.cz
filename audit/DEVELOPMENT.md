# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Další úkol: prověřit stejnou chybu čekání na cancel v backendové čtečce.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-11

- Odpověď větší než limit už nečeká na dokončení zrušení proudu. Zrušení se vyžádá a případná chyba úklidu se zachytí; původní chyba velikosti se ihned předá volajícímu.
- Regresní scénář simuluje cancel, který nikdy neskončí, a vyžaduje odmítnutí původní chybou limitu.
- Ověření: node audit/tests/regression.cjs; git diff --check.
- Limit 2 MiB už byl na main, starý lokální commit se znovu nepřenášel. Předchozí prázdný cherry-pick byl bezpečně ukončen.
