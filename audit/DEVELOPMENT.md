# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- V prohlížeči extrakce používá XML DOM a pouze přímé položky url/sitemap a jejich loc ve stejném namespace jako kořen. Obrázkové a další rozšiřující loc se nezařazují mezi stránky ani do fronty sitemap.
- Chromium kontroluje vnořené i přímé image:loc, zachování XML entit a počty v celém auditu s obrázky v každé child sitemapě.
- Ověření: místní regresní sada, syntaxe a diff kontrola; nativní parser a produkční kontroly v CI. Node bez DOMParser ponechává dosavadní pomocnou extrakci, produkční prohlížeč používá DOM.
- Další priorita: sjednotit parsování XML mezi validací a extrakcí, aby se velké dokumenty neparsovaly opakovaně.
