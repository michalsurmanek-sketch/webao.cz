# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Po dokončení objevování odkazů se původ již načtených stránek obnovuje z finálních map zdrojů. Dříve report/CSV používaly starý snapshot a později nalezený interní odkaz nebyl vidět.
- Homepage si zachovává své označení; data stránky a skóre se nemění.
- Chromium ověřuje stránku načtenou ze sitemap, na kterou následně odkáže jiná načtená stránka; výsledný inventář obsahuje sitemapové i interní zdroje.
- Ověření: místní regrese, syntaxe a diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: prověřit deduplikaci více příchozích zdrojů v discoverPageLinks, kde se zatím zachovává první zdroj v jednom průchodu.
