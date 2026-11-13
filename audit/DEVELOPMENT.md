# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Relativní odkazy: parser používá požadovanou URL; Reader URL Source není ověřený HTTP redirect. Bez ověřeného cíle nelze bezpečně změnit základ adres ani potvrdit přesměrování.
- Potvrzen další nesoulad: CSV export používal vlastní normalizaci bez odstranění tracking parametrů, a proto označoval cíle jinak než mapa. Export nyní používá společný auditLinkKey pro vzorek i cíle.
- Ověření: kompletní místní regrese a diff; CI ověřuje Chromium i produkční dostupnost.
- Další priorita: doplnit integrační CSV případ s tracking variantou cíle a ověřit původ adres po přesměrování bez spoléhání na Reader metadata.
