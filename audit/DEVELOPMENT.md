# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Čtečka HTML nepotvrzuje konečnou adresu po přesměrování. Požadovaná URL proto už není automaticky považována za ověřený základ pro porovnávání relativních metadat.
- Absolutní cíle se dál porovnávají; relativní cíle se porovnávají pouze s použitelným absolutním base[href]. Neznámé/relativní základy a neplatné cíle se vykazují jako neověřené bez bodového dopadu.
- Regrese pokrývá falešný konflikt po možném redirectu, dostupný absolutní base i skutečně různé cíle.
- Ověření: regresní sada, git diff --check a CI PR s prohlížečovými scénáři.
- Další úkol: rozšířit prohlížečové testy metadat o reálný DOMParser a base elementy (dosavadní extrakční regrese používají zjednodušený DOM).
