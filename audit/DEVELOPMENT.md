# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Evidence HTML metadat má nejvýše 10 ukázek po 160 znacích s výslovným označením zkrácení a počtem položek. Platí pro souhrn, canonical/hreflang konflikty i neověřené cíle.
- Úplné hodnoty se zachovávají při porovnávání a ve zpracovaných metadatech; zkrácení zobrazení neslučuje cíle a nemění skóre.
- Regrese s 200 dlouhými cíli potvrzuje oba konflikty a evidence pod 2000 znaků na nález. Pokryt i výpis neověřených cílů.
- Ověření: regresní sada a git diff --check; CI ověřuje produkční dostupnost i prohlížečové scénáře.
- Další úkol: prověřit limity inventáře URL a evidence u velkých sitemap; zkrácení musí být odlišeno od úplného pokrytí webu.
