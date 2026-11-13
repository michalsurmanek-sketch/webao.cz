# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Opakování evidence v nálezech: nález nedostupné čtečky opakuje typ zdroje, nikoli dlouhý seznam adres; plošné krácení není podložené.
- Potvrdila se související chyba původu: odkaz stránky na sebe (včetně fragmentu či tracking parametrů) se zaznamenával jako další zdroj jejího objevení. discoverPageLinks nyní vlastní normalizovanou URL vynechává.
- Chromium ověřuje fragment, tracking variantu a zachování skutečného odkazu z jiné stránky. Existující hustý vzorek a celý audit zůstávají pokryty.
- Ověření: místní regrese, syntaxe a diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: prověřit jednotnou normalizaci cílových a zdrojových URL při počítání příchozích odkazů.
