# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Opraveno: inventář odkazů a obrázků zachovává Markdown cíle s volitelným titulkem v jednoduchých či dvojitých uvozovkách i závorkách.
- Podporováno: oddělení titulku novým řádkem, escapované uvozovky, URL v úhlových závorkách a obrázek uvnitř odkazu.
- Neúplný titulek, chybějící oddělovač a přebytečný text nevytvářejí falešné odkazy.
- Ověření: kompletní regresní sada prošla, včetně nových pozitivních a negativních scénářů.
- Prohlížečové ověření: místní Chromium blokují omezení prostředí; na push navazuje existující CI pro desktop, mobil a dokončení auditu při výpadcích zdrojů.
- Další priorita: pokračovat v ověřování neúplných a namespacovaných sitemap podle kritérií výše.
