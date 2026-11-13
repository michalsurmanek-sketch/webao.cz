# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Opraveno: escapované otevírací a zavírací hranaté závorky již nevytvářejí falešné odkazy a obrázky.
- Počet předcházejících zpětných lomítek rozlišuje escapování od skutečné syntaxe. Escapovaný vykřičník zachovává následující běžný odkaz.
- Ověření: kompletní místní regresní sada včetně nových negativních a pozitivních případů, zachování odkazu obalujícího obrázek.
- Místní Chromium nelze spustit: v prostředí chybí binární prohlížeč. Prohlížečové a produkční kontroly zajišťuje CI.
- Další priorita: prověřit cíle Markdown odkazů s volitelným titulkem, aby platné odkazy nevypadávaly z inventáře.
