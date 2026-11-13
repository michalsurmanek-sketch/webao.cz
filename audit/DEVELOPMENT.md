# Vývoj Webmetru

## Podmínky pro hotové první vydání

Hotové vydání se posuzuje podle ověřitelných scénářů, nikoli podle počtu commitů nebo odhadovaného procenta.

- [ ] Kompletní průchod: zadání domény, průběh, dokončení a nový audit ověřené na desktopu i mobilu z aktuálního main.
- [ ] Reálné měření: alespoň jeden doložený běh se současně dostupným mobilním i desktopovým Lighthouse výsledkem; vyřešená dostupnost služby pro běžný provoz. Veřejné PageSpeed API v reportu Montao z 13. 11. vyčerpalo kvótu, cache tento problém plně neřeší.
- [ ] Srozumitelnost: částečné měření, stáří uložených výsledků a neověřené kontroly musí být zřetelné na obrazovce i v PDF/CSV. Nezaměňovat pokrytí za skóre webu.
- [ ] Výpadky: selhání nebo kvóta jednotlivého zdroje nezablokuje report ani další audit; neúplné výsledky nesmějí penalizovat web.
- [ ] Výstupy: PDF i CSV z aktuálního vydání ověřeny na reálném a simulovaném částečném běhu; PDF bez překryvů a ořezů.
- [ ] Regrese a prohlížeč: všechny povinné CI kontroly na vydávaném commitu úspěšné; žádná známá blokující chyba z těchto scénářů.

## Priority

1. Dostupnost měření a poctivé vysvětlení rozsahu: prověřit původ a stáří cache v reportu, měření při vyčerpané kvótě a možnosti provozně spolehlivého PageSpeed přístupu. Nevydávat cache za nové měření.
2. Dokončení celého toku při částečných výpadcích a možnost spustit nový audit bez reloadu.
3. Mobil a exporty: vizuální kontrola aktuálního PDF a výsledků, reprezentativní běh s dostupnými i nedostupnými zdroji.
4. Správnost inventáře: podporované Markdown odkazy s volitelným titulkem, sitemap namespace/entity a neúplné zdroje; nepřidávat chyby ze zdrojů, které nelze ověřit.

## Poslední změna — 2026-11-13

- Potvrzeno: po kvótové chybě mobilního PageSpeed se desktop přeskočil i s platným výsledkem v cache.
- Před přeskočením druhého zařízení se nyní ověří jeho cache; při platném výsledku se použije bez nového síťového požadavku a dokončí se počítadlo průběhu.
- Sdílené bezpečné čtení cache ověřuje zařízení, doménu a chybu Lighthouse; chybná nebo nepřístupná cache zůstává nedostupným zdrojem.
- Robots pravidla mají stále přednost a nedovolují použití cache pro vyloučené měření.
- Ověření: kompletní místní regrese, pozitivní cache, neplatné zařízení/doména, runtime error, blokované úložiště a robots; prohlížeč a produkce v CI.
- Omezení: bez platné cache a při vyčerpané kvótě nelze Lighthouse výsledek získat; oprava nevytváří chybějící měření.
- Další krok: stáří a původ uložených měření v přehledu zdrojů a reportu.
- Opraveno: inventář odkazů a obrázků zachovává Markdown cíle s volitelným titulkem v jednoduchých či dvojitých uvozovkách i závorkách.
- Podporováno: oddělení titulku novým řádkem, escapované uvozovky, URL v úhlových závorkách a obrázek uvnitř odkazu.
- Neúplný titulek, chybějící oddělovač a přebytečný text nevytvářejí falešné odkazy.
- Ověření: kompletní regresní sada prošla, včetně nových pozitivních a negativních scénářů.
- Prohlížečové ověření: místní Chromium blokují omezení prostředí; na push navazuje existující CI pro desktop, mobil a dokončení auditu při výpadcích zdrojů.
- Další priorita: pokračovat v ověřování neúplných a namespacovaných sitemap podle kritérií výše.
- Opraveno: XML se stejným názvem kořene, ale cizím namespace už nepotvrzuje sitemapu. Podporovány zůstávají standardní sitemap namespace i starší dokumenty bez namespace.
- Opraveno: adresa loc s vnořenými XML elementy se nezařazuje do inventáře. Text, CDATA a escapované entity zůstávají podporované.
- Ověření: kompletní místní regresní sada prošla; přidány nativní prohlížečové scénáře pro prefixy, cizí namespace, CDATA a celý audit bez bodového dopadu neověřené sitemapy.
- Existující prohlížečová sada nadále ověřuje 15 000 URL, neúplné XML a dokončení auditu. Její spuštění zajišťuje CI; místní Chromium blokuje prostředí.
- Další priorita: ověřit úplnost seznamu URL při odpovědích textové čtečky a srozumitelné vyznačení omezeného vzorku v reportu.
