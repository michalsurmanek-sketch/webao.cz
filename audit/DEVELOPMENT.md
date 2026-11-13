# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Ověřený typ XML urlset má přednost před heuristikou textového indexu. Čtečkový titulek Sitemap a URL končící .xml již nevyřadí skutečnou položku urlset.
- Heuristika zůstává pouze pro zdroje bez rozpoznaného XML typu; podporované textové indexy zachovávají dosavadní chování.
- Chromium ověřuje zachování catalog.xml mezi stránkami, prázdnou frontu podřízených sitemap a zachování textového indexu.
- Ověření: místní regrese, syntaxe a diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: zpřesnit nejistotu textových indexů, kde samotná přípona .xml není průkazným typem zdroje.
