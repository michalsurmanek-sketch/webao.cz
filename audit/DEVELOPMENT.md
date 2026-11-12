# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- Odstraněno opakované lineární hledání duplicit v extrakci kandidátů sitemap a normalizovaných URL/indexů; množiny Set zachovávají pořadí prvního výskytu.
- Regrese: 15 000 unikátních URL s duplicitami a 2 000 sitemap indexů s duplicitami, bez ztráty adres a změny pořadí.
- Orientační místní měření stejného XML (588 907 bajtů, 15 000 URL): před změnou 2 105 ms, po změně 96 ms. Nejde o garantované časy v prohlížeči.
- Limity počtu auditovaných stránek a požadavků se nemění; inventář se nezkracuje a skórování není dotčeno.
- Ověření: regresní sada a git diff --check; CI ověřuje browser scénáře a produkční dostupnost.
- Další úkol: explicitně vykázat sitemap soubory vynechané kvůli limitu požadavků, odlišit je od chyb načítání.
