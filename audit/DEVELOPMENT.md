# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Doplněno chybějící nativní měření hustých odkazů: 30 zdrojových stránek × 1 000 cílů + 100 opakovaných odkazů na stránku, celkem 33 000 odkazů.
- Kritéria: přesně 1 000 cílů, 30 unikátních zdrojů pro každý cíl, zachované pořadí, konzervativní CI strop 10 s a serializovaná evidence krátkých fixture URL pod 2 MiB. Log vypisuje skutečný čas a velikost.
- Bez prokázané potřeby se evidence nekrátí; dlouhé URL a plný report vyžadují další měření. Testový limit není garance na každém zařízení.
- Ověření: místní regrese, syntaxe a diff kontrola; nativní měření v Chromium a produkční kontroly v CI.
- Další priorita: změřit růst reportu s dlouhými zdrojovými URL a případně zavést výslovně označené ukázky.
