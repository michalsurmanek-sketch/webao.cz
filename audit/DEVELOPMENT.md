# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Sitemap zakázaná robots.txt uvnitř indexu se nově zapisuje do sitemapSkipped. Stejně se evidují zakázané soubory ve zbytku fronty po vyčerpání rozpočtu.
- Report obsahuje samostatnou skupinu s důvodem vynechání a CSV samostatný počet; nezaměňují se za chyby čtení ani vynechání rozpočtem. Duplicity se nezapočítávají vícekrát.
- Chromium integrační scénář rozšířen o blokovaný soubor před i za hranicí rozpočtu a jejich duplicity; požaduje nulové požadavky na oba, dva záznamy v reportu i CSV, pět rozpočtových vynechání a jedinou skutečnou chybu čtení.
- Ověření: syntaxe browser testu, regresní sada a git diff --check; nativní scénář spouští CI PR.
- Další úkol: obdobně prověřit sitemap deklarace z robots.txt, které filtr vyřadí ještě před vložením do fronty.
