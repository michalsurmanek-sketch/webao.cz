# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Výkon sitemap: nativní test 15 000 unikátních URL a 100 duplicit pod 2 MiB musí zachovat pořadí/entity a dokončit do konzervativního CI limitu 10 s. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-13

- Kandidát atributů: platné XML zapisuje znak < jako entitu, která dosavadní regex nepřepíná. Potvrdil se ale příbuzný problém: vnořená rozšiřující značka opačného typu vyřadila platné URL.
- V prohlížeči typ určuje kořen ověřeného XML DOM místo hledání značek kdekoli v dokumentu. Používá se existující omezená cache parseru.
- Chromium pokrývá urlset s ext:sitemapindex i index s ext:urlset, včetně escapovaných atributů. Zachování CDATA a měření 15 000 URL zůstávají pokryty.
- Ověření: místní regrese, syntaxe a diff kontrola; Chromium a produkční kontroly v CI.
- Další priorita: prověřit rozlišení textového indexu a urlset u čtečkového titulu Sitemap a stránek končících .xml.
