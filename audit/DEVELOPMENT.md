# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Zakázané sitemap deklarace z robots.txt se před filtrováním povolených požadavků ukládají do evidence vynechaných souborů.
- Integrační Chromium scénář obsahuje duplicitní zakázanou deklaraci dostupnou pouze z robots.txt a deklaraci současně uvedenou v indexu. Vyžaduje přesně tři unikátní vynechání v reportu/CSV a žádné požadavky na zakázané soubory.
- Počty rozpočtových vynechání a skutečných chyb zůstávají oddělené. Povolené požadavky a skóre se nemění.
- Ověření: syntaxe prohlížečového testu, regresní sada, git diff --check; integrační scénář provádí CI.
- Další priorita: prověřit, že výpadek nebo neúplný sitemap index nevytváří falešné potvrzení úplnosti inventáře a že se rozpoznání XML neopírá o značky v komentářích.
