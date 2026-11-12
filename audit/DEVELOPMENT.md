# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Další úkol: ověřit dokončení reportu při výpadcích zdrojů v prohlížeči.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Připraven prohlížečový test celého formuláře pro desktop (1365 px) a mobil (390 px): všechny zdroje nedostupné a dostupný robots.txt při výpadku ostatních zdrojů.
- Kritéria: vznikne report, nevznikne skóre z nedostupných zdrojů, tlačítko se obnoví a zmizí aria-busy; neověřený robots.txt zamezí požadavkům na stránky.
- Test pracuje s lokálním HTML a blokuje skutečné externí požadavky. Zapojen do browser jobu GitHub CI.
- Lokální spuštění Chromium blokuje prostředí: socket() Operation not permitted. Vyšší oprávnění nejsou povolena. Prohlížečový test zatím není označen jako ověřený a PR zůstává návrhový.
- Ověření dostupné lokálně: syntaxe nového testu, regresní sada a git diff --check.
- Další úkol: spustit browser job na větvi PR, vyřešit případná selhání a sloučit až po úspěšném ověření.

### Doplnění ověření CI

- PR #9 dosud neměl žádný běh spuštěný událostí pull_request. Workflow podporovalo pouze push, plán a ruční spuštění.
- Doplněn pull_request trigger pro audit/assets/workflow a povolen browser job i pro tuto událost. Prohlížečové ověření zůstává podmínkou sloučení.
- CLI nemá přihlášení a GitHub konektor neposkytuje workflow_dispatch; automatické spuštění událostí PR je proto důležité pro další ověřování.
