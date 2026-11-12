# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Po vyčerpání rozpočtu sitemap se vykazuje počet unikátních dosud nevyžádaných, robots-povolených souborů a nejvýše 100 příkladů.
- Report i CSV odlišují tento stav od chyb načítání a od limitu auditovaných stránek. Poznámka vysvětluje, že URL z nevyžádaných sitemap nejsou v inventáři.
- Testováno odstranění duplicit, již vyžádaných souborů, neplatných adres a robots-zakázaných cest; prázdná fronta nevytváří vynechání.
- Rozpočet požadavků ani skóre se nemění.
- Ověření: regresní sada a git diff --check; CI ověřuje prohlížečové scénáře a produkční dostupnost.
- Další úkol: prohlížečový integrační scénář rozsáhlého sitemap indexu, který vyčerpá rozpočet a ověří počty i export.
