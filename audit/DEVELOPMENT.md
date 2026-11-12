# Vývoj Webmetru

## Priority a kritéria dokončení

1. Spolehlivost zdrojů: každá chyba čtení nebo neúplná odpověď skončí jako neověřená; nesmí blokovat dokončení auditu ani penalizovat skóre. Frontendová čtečka i healthcheck mají neblokující zrušení přenosu. Report při výpadcích ověřen CI PR #9.
2. Dokončit ověření sitemap: neplatné a neúplné XML nesmí přidat URL ani body; pro namespace a entity doplnit ověřené scénáře. Ověření celého běhu v prohlížeči: audit s dostupnými i nedostupnými externími zdroji dokončí report a obnoví tlačítko; potvrdit mobilní zobrazení.
3. HTML metadata: regresní případy pro neúplnou hlavičku a přesměrování; neověřená metadata bez bodového dopadu.

## Poslední změna — 2026-11-12

- XML sitemap se uznává jen po úspěšném parsování celého dokumentu s kořenem urlset/sitemapindex. Useknuté XML, nesouhlasící značky, samotné loc a neukončené komentáře nejsou ověřený zdroj.
- Zachovány čtečkové obálky, XML bloky v Markdownu a dosavadní textový formát Sitemap. XML s chybou nesmí propadnout do textového fallbacku.
- Chromium scénář kontroluje parser včetně CDATA a druhý celý audit ověřuje, že neúplný root přidá 0 souborů/URL a nález zůstane NELZE OVĚŘIT s points=null. Neúplný child je evidován mezi selháními bez URL v inventáři.
- Ověření: místní regresní sada, syntaxe browser testu a git diff --check prošly; nativní Chromium a produkční kontroly provádí CI (místní sandbox Chromium nespustí).
- Další priorita: prověřit podporu namespace prefixů a XML entit, aby platné sitemapy neztrácely URL při regexové extrakci.
