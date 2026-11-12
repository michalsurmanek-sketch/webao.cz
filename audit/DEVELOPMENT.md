# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Rozpoznávání sitemap, typ index/urlset a extrakce loc podporují XML namespace prefixy. Platná prefixed sitemap dříve nebyla rozpoznána nebo se URL načítaly náhradním textovým regexem bez dekódování entit.
- Chromium integrační fixture používá prefixované child sitemapy s amp entitou; kontroluje zachování počtu URL. Parser nadále odmítá neúplné XML.
- Ověření: místní regresní sada, syntaxe testu, diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: omezit extrakci loc na přímé položky sitemap, aby se URL rozšíření (např. obrázků) nezaměňovaly za stránky.
