# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Přidán browser-sitemaps.cjs: celý formulář s řízeným indexem 12 podřízených sitemap, cyklem na kořen, duplicitou, robots-zakázaným souborem a jedním výpadkem.
- Ověřuje rozpočet osmi požadavků, sedm načtených souborů, jednu chybu, pět nevyžádaných souborů a šest objevených URL. Kontroluje shodu počtu v reportu i skutečně vytvořeném CSV blobu.
- Test zapojen do browser CI jobu; lokální syntaxe, regrese a diff check procházejí. Provedení skutečného Chromium testu ověřuje CI.
- Další priorita: sledovat případná selhání nového integračního scénáře a potom prověřit klasifikaci sitemap blokovaných robots.txt uvnitř indexů.
