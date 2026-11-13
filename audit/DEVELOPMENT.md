# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Potvrzeno zkracování URL obrázků se závorkami. Obrázky a odkazy nyní sdílejí čtení vyvážených cílů včetně úhlových závorek.
- Odstranění obrázkové syntaxe zachovává obalový odkaz; neúplný obrázek se nevydává za navigační odkaz.
- Regrese pokrývá vnořené závorky, úhlové cíle, proklikávací obrázek a neúplný cíl.
- Ověření: kompletní místní regrese a diff; Chromium a produkční dostupnost v CI.
- Další priorita: prověřit Markdown escape sekvence v cílech, aby zpětná lomítka nevytvářela jiné URL.
