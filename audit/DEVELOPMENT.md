# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Doplněno nativní měření skutečného reportu a CSV pro 30 stránek, každou s 30 zdroji o přibližně 2 000 znacích. Kontroluje zachování posledního zdroje bez tichého zkrácení.
- CI vypisuje čas renderu a velikost HTML/CSV; konzervativní kritéria fixture: render pod 10 s, každá reprezentace pod 8 MiB. Nejde o garanci pro libovolné URL nebo zařízení.
- Bez měření potvrzujícího potřebu se evidence nekrátí; test vytváří podklad pro cílené omezení zobrazení při dalším růstu.
- Ověření: místní regrese, syntaxe a diff kontrola; nativní render a produkční kontroly v CI.
- Další priorita: prověřit agregaci více zdrojů v nálezech, zda nezvětšuje report opakováním stejné evidence.
