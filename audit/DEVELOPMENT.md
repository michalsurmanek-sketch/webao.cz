# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Potvrzená chyba: textový výstup s explicitním titulkem Sitemap Index a adresou bez .xml se nesledoval jako index a přidával se mezi stránky. Explicitní index nyní podporuje i adresy bez přípony.
- Ověřený XML urlset má nadále přednost před titulkem čtečky. Obecná příponová heuristika zůstává beze změny; její plošná změna vyžaduje samostatné vykázání nejistoty v reportu.
- Chromium kontroluje extensionless index, prázdný seznam stránek indexu a přednost skutečného XML typu.
- Ověření: místní regrese, syntaxe a diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: vykázat nejistotu u obecných textových sitemap, jejichž typ se pouze odhaduje z přípony URL.
