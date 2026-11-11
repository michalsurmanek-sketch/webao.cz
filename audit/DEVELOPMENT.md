# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Další úkol: ověřit dokončení reportu při výpadcích zdrojů v prohlížeči.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Produkční healthcheck už při chybě čtení nebo překročení limitu nečeká na zrušení proudu; požádá o zrušení jednou a zachová původní chybu.
- Regrese pokrývá nikdy nedokončený cancel a odmítnutý cancel, který nesmí přepsat původní chybu.
- Ověření: node audit/tests/regression.cjs; node audit/tests/healthcheck.cjs; git diff --check.
- Backend neobsahuje samostatnou čtečku odpovědí. Potvrzená obdobná chyba byla v audit/tests/healthcheck.cjs.
- Další úkol: prohlížečový scénář částečně nedostupných externích zdrojů a obnovení ovládacích prvků.
