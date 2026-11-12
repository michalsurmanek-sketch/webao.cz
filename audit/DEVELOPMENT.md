# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Falešné head značky v komentářích, obsahu script/style/title/textarea/noscript, template a citovaných atributech už nepotvrzují úplnost hlavičky.
- Přidán konzervativní průchod zdrojovými značkami; skutečnou extrakci dál provádí DOMParser. Nejde o obecný validátor HTML.
- Regrese pokrývá falešné uzavření v neúplných zdrojích i platnou hlavičku obsahující zavádějící text. Nativní browser test odmítá stejné neúplné zdroje.
- Ověření: regresní sada, syntaxe browser testu a git diff --check; CI PR ověřuje skutečný Chromium parser.
- Další priorita: prověřit omezení počtu nálezů a velikosti evidence u velmi rozsáhlých sitemap a metadat, aby report zůstal použitelný.
