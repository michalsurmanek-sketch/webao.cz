# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Detekce urlset/sitemapindex v inventáři ignoruje CDATA. Text obsahující název opačného typu dokumentu již nevyřadí skutečné URL stránky nebo podřízené sitemapy.
- Původní XML se nadále předává parseru, takže loc v CDATA a validace úplnosti zůstávají zachované. Odstranění CDATA se týká pouze pomocné detekce typu.
- Chromium pokrývá oba směry: falešný index v urlset a falešný urlset v indexu. Stávající testy ověřují loc CDATA a neúplné XML.
- Ověření: místní regrese, syntaxe a diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: prověřit falešné značky v atributech XML při pomocné detekci typu dokumentu.
