# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Doplněn browser-metadata.cjs: skutečný DOMParser a produkční fetchPageHtmlMetadata s řízenými odpověďmi bez externích požadavků.
- Pokryto první base[href], dekódování HTML entit, ekvivalentní canonical/hreflang, značky v body, neověřený relativní základ, skutečně odlišné absolutní cíle a neúplné odpovědi.
- Všechny metadata signály musí zůstat mimo skóre. Test je součástí browser CI jobu.
- Lokální ověření: syntaxe, regresní sada, git diff --check. Skutečný prohlížeč ověřuje CI, protože místní prostředí blokuje Chromium.
- Další úkol: prověřit falešné značky head uvnitř komentářů a scriptů při kontrole úplnosti vstupu, kterou nyní provádí regulární výraz.
