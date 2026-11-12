# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Sdílené oddělení Markdown Content se používá před detekcí typu sitemap, validací i XML/textovou extrakcí. Falešný sitemapindex/loc v anotaci již nemůže změnit typ dokumentu ani vyřadit použitelný textový obsah.
- Chromium pokrývá anotaci s falešným indexem před textovou i XML sitemapou, zachování skutečné URL a prázdnou frontu indexů.
- Ověření: místní regrese, syntaxe a diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: přidat měření výkonu velkých sitemap v nativním browser parseru a stanovit ověřitelné limity odezvy.
