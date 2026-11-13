# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Opraveno: XML se stejným názvem kořene, ale cizím namespace už nepotvrzuje sitemapu. Podporovány zůstávají standardní sitemap namespace i starší dokumenty bez namespace.
- Opraveno: adresa loc s vnořenými XML elementy se nezařazuje do inventáře. Text, CDATA a escapované entity zůstávají podporované.
- Ověření: kompletní místní regresní sada prošla; přidány nativní prohlížečové scénáře pro prefixy, cizí namespace, CDATA a celý audit bez bodového dopadu neověřené sitemapy.
- Existující prohlížečová sada nadále ověřuje 15 000 URL, neúplné XML a dokončení auditu. Její spuštění zajišťuje CI; místní Chromium blokuje prostředí.
- Další priorita: ověřit úplnost seznamu URL při odpovědích textové čtečky a srozumitelné vyznačení omezeného vzorku v reportu.
