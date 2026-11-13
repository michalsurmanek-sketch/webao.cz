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

## Etapa AI Ready 2027 — stabilizace zdrojů

- Zadání a návrh architektury jsou v [AI_READY_2027.md](AI_READY_2027.md). AI modul, skóre a placené API zatím nejsou aktivní; nejprve platí kritéria vydání výše.
- Report a CSV rozlišují uložený PageSpeed výsledek od odpovědi získané v tomto běhu. Zobrazují čas měření od poskytovatele a u cache čas uložení; nedoložený čas se neodhaduje.
- Cache odmítá budoucí, neplatné a expirované časové údaje. Validní cache zachovává úsporu požadavků při kvótě, s předností robots pravidel.
- Doplněny regresní testy původu/časů, CSV a cache; prohlížečový scénář s kvótou a cache vytváří desktop/mobil screenshoty a tiskové PDF.
- Vizuální QA prvního CI PDF odhalila světlé tabulky a tmavé obsahové karty v tisku. Doplněny tiskové barvy a zalamování karet, bez změny vzhledu webu; prohlížečový test nově ověřuje konkrétní tiskové barvy a načítá skutečné sdílené CSS.
- Nasazení: až po úspěšné regresi a povinných CI kontrolách vydávaného commitu. Samotná existence testu není potvrzení výsledku.
- Zbývá: skutečné současné mobilní i desktopové měření při běžné dostupnosti API; vizuální QA PDF a mobilu z aktuálního commitu. Bez toho produkt neoznačovat jako hotový.

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

## Ověřené změny cache — 2026-11-13

- PR #52: odmítání výsledků Lighthouse s runtimeError; regresní, produkční a prohlížečové CI prošly; sloučeno do main.
- PR #53: přísnější validace narušila kompatibilitu s existujícími scénáři; CI neprošlo a PR bylo uzavřeno bez nasazení.
- PR #54: validace kategorií a číselného skóre při zachování starších výsledků bez kategorií; regresní, produkční a prohlížečové CI prošly; sloučeno do main.
- Navazující oprava: poškozený JSON cache se bezpečně odstraní a další zápis může proběhnout; před nasazením musí projít CI.
- Kritéria prvního vydání zůstávají otevřená, zejména současné reálné Lighthouse měření na obou zařízeních a vizuální QA exportů.

## Kontrola hranic skóre — 2026-11-13

- Opravena nekonzistence mobilního Lighthouse fallbacku metadat: rozhodnutí vyhovuje se nyní porovnává s původním skóre 0,9, nikoli zaokrouhlenou hodnotou 90. Hodnoty 0,895–0,899 nesmějí změnit stav na vyhovující pouhým zaokrouhlením.
- Regrese ověřuje obě strany hranice; zobrazené body se nadále zaokrouhlují.
- Ověření: všechny čtyři místní sady podle CI, kontrola diffu; prohlížeč a produkce v CI.
- Další priorita: dokončit kritéria reálného měření a vizuální QA aktuálních exportů; tato oprava sama neznamená hotové vydání.

## Etapa izolace opakovaných běhů — 2026-11-13

- Rozšířen celý prohlížečový průchod při výpadcích: druhý audit bez reloadu nyní používá jinou doménu. Ověřuje nový report, inventář a síťové požadavky bez ponechání první domény.
- Scénář běží na desktopu i mobilu s dostupnými i nedostupnými robots pravidly; stále kontroluje nepenalizování neověřených zdrojů a obnovení ovládání.
- Lokálně ověřena syntaxe a čtyři regresní sady; reálné spuštění Chromium zajišťuje CI kvůli omezením místního sandboxu.
- Kritéria reálného Lighthouse měření a vizuálního QA nejsou tímto simulovaným testem splněna. Další priorita zůstává reprezentativní živé měření a kontrola exportů.
