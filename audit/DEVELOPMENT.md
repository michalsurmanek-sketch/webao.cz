# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- discoverPageLinks nyní zachovává všechny odkazující stránky pro jednu cílovou URL v jednom průchodu. Dříve deduplikace URL zahodila další zdroje.
- Cílová URL zůstává v inventáři jednou; samostatné zdrojové adresy jsou deduplikované a přenášejí se do finálního inventáře/reportu/CSV.
- Chromium fixture odkazuje na stejnou stránku z page1 i page2 a ověřuje zachování obou adres vedle sitemapových zdrojů.
- Ověření: místní regrese, syntaxe a diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: zkontrolovat velikost evidence zdrojů u hustě propojených webů a případné označené omezení ukázek.
