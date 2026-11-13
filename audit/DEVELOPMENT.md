# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Reader URL Source stále neposkytuje ověřený cíl HTTP přesměrování; základ relativních adres proto bez důkazu neměníme. Integrační CSV tracking případ již přítomen z PR #44.
- Potvrzen falešný pozitivní odkaz: samotný text ](/cesta) se přidával do inventáře. Parser nyní vyžaduje i otevírací závorku popisku.
- Regrese ověřuje odmítnutí neúplné syntaxe, existující scénáře zachovávají relativní odkazy a proklikávací obrázky.
- Ověření: kompletní místní regrese a diff; Chromium a produkční dostupnost v CI.
- Další priorita: prověřit Markdown cíle obsahující závorky a úhlové závorky, aby nevznikaly zkrácené adresy.
