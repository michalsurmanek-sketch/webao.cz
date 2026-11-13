# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Potvrzen nesoulad: crawl odstraňoval tracking parametry, ale mapa a počítání příchozích odkazů je ponechávaly. Odkaz s tracking parametry pak chybně vypadal jako cíl mimo vzorek.
- auditLinkKey nyní používá stejné pravidlo pro tracking parametry; funkční parametry a koncová lomítka zůstávají odlišné.
- Regrese pokrývá deduplikaci variant, vlastní odkazy, nedostupné zdroje/cíle, funkční parametry a lomítka.
- Ověření: místní regrese a diff; nativní Chromium a produkční kontroly v CI (místní sandbox spuštění Chromium nepovoluje).
- Další priorita: prověřit odkazy relativní vůči přesměrované stránce a jejich základní URL; bez ověřeného cíle neslučovat adresy.
