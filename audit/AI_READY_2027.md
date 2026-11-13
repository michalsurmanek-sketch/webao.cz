# WEBAO Audit — AI Ready 2027

Stav k 13. 11. 2026. Tento dokument rozlišuje hotové funkce, podmínky vydání a návrh. AI modul ani měření AI zmínek nejsou zatím spuštěné. Platby a pevné ceny se nezavádějí.

## Etapy a rozhodnutí

1. **Stabilní základ:** doložené zdroje a jejich stáří, dostupné versus neověřené kontroly, dokončení běhu při chybách, opakovaný audit, desktop/mobil, PDF/CSV a úspěšná CI na vydávaném commitu. Kritéria v DEVELOPMENT.md jsou závazná pro označení produktu za dokončený.
2. **Technická AI připravenost:** samostatný modul, nejprve kontroly zdrojů a důkazy bez souhrnného skóre. Zapnutí po splnění etapy 1, ne současným rozšířením nestabilního toku.
3. **Verzované AI skóre:** až s ověřenými pravidly a regresními scénáři, oddělené od dosavadního skóre a od AI viditelnosti.
4. **Měřená AI viditelnost:** backendové adaptéry oficiálních API, rozpočet a historie; bez API odpovědi zobrazit „Neměřeno“, nikdy nulu zmínek.
5. **Monitoring a nabídky:** plánovač, fronta, upozornění, oprávnění zdarma/PRO/Monitoring; monetizace samostatně, bez plateb v této etapě.

## Skutečný stav současného produktu

| Oblast | Existující implementace | Co zbývá doložit / dokončit |
|---|---|---|
| Běh auditu | Klientská aplikace v audit/index.html, izolované chyby zdrojů, průběh | Aktuální mobilní i desktopový celý průchod, opakovaný běh a vizuální kontrola |
| Zdroje | Veřejná textová čtečka, robots, sitemap, DNS, RDAP, PageSpeed, volitelný Observatory | Provozně dostupné PageSpeed měření obou zařízení; textová čtečka nenahrazuje úplné HTML ani HTTP hlavičky |
| Cache | Úspěšné PageSpeed odpovědi, TTL 6 hodin; validace domény/zařízení a runtime error | Původ a čas v reportu doplňuje tato etapa; cache neřeší chybějící nový výsledek při kvótě |
| Hodnocení | Váhy oblastí, neověřené kontroly bez penalizace, oddělené pokrytí, historie metodiky | Pokračovat v ověřování s reálnými dostupnými i částečnými zdroji |
| Inventář | Sitemap i interní odkazy, limity a původ URL; namespace, entity, Markdown odkazy | Úplnost převodu čtečkou nelze garantovat; žádné tvrzení o kompletním crawlu |
| Výstupy | Report, tisk/PDF přes prohlížeč, CSV, místní historie a stavy oprav | Vizuálně ověřit PDF bez překryvů na aktuálním commitu |
| Konkurence | Existující omezené obsahové signály | Není plné technické/SEO/AI porovnání; použít shodný profil kontrol a maximálně 3 soupeře |
| AI | Žádná ověřená integrace pro AI zmínky | Neoznačovat dosavadní obsahové signály za AI skóre nebo doporučování |

## Architektura bez změny současného vzhledu

Zachovat existující report a kontrolní tok. Nový modul přidat přes samostatnou sekci s příznakem zapnutí; selhání modulu nikdy nesmí blokovat základní report. Nezpřístupňovat nehotové ovládání.

Datové vrstvy:

- `AuditRun`: id, normalizovaný cíl, profil, metodika, začátek/konec, rozsah URL, stav dokončeno/částečné/selhalo.
- `Evidence`: id, runId, zdroj, URL, čas získání, čas měření pokud jej zdroj uvádí, cache/stáří, HTTP stav pokud byl skutečně získán, hash obsahu, ověřený rozsah, chyba. Čas získání není čas měření.
- `Finding`: stabilní ruleId a verze, evidenceIds, URL, observed/unverified/not_applicable, zjištění, dopad, postup opravy, priorita, jistota. Hypotéza není doložená chyba.
- `TechnicalReadiness`: pouze technická pravidla, score nebo null, coverage, confidence, methodologicalVersion. Nemíchat se zmínkami v AI.
- `VisibilityObservation`: poskytovatel, produkt/API, model a verze pokud dostupná, prompt a hash, jazyk, lokalita, datum, parametry, raw response reference, mentions, cited URLs, stav zdrojů, náklady a limity. Neúspěšná odpověď znamená unknown.
- `UsageEvent`: runId, zdroj/model, requestId, počet pokusů, cacheHit, tokeny, náklady pokud je poskytovatel doloží; neznámé náklady nejsou 0 Kč.

Backend vybrat podle stávajícího provozu až pro bezpečné přímé načtení webů a API s klíčem. Klíče nesmějí být v prohlížeči ani veřejném repozitáři. Současná statická aplikace neprokazuje přístup konkrétního AI robota přes CDN/WAF.

## Technické kontroly AI modulu

| Kontrola | Důkaz | Omezení / interpretace |
|---|---|---|
| OAI-SearchBot, Googlebot, PerplexityBot | Aktuální robots.txt + rozhodující skupina a cesta | Deklarace pravidel, ne potvrzení průchodu WAF nebo zařazení do odpovědí |
| GPTBot, Google-Extended | Samostatné informativní vyhodnocení | Trénování oddělit od vyhledávání; zákaz trénování nesnižuje skóre viditelnosti |
| Indexovatelnost | Ověřené HTML robots, canonical, HTTP X-Robots-Tag | Bez hlaviček či bez úplného HTML unknown; skutečnou indexaci ověřuje oprávněná Search Console integrace |
| JSON-LD | JSON.parse všech skutečně získaných bloků, syntaxe, kontext a typy | Validní JSON není validní Schema.org, validní schema není rich result; samostatné výstupy |
| Firma a kontakty | Organization/LocalBusiness, viditelný obsah, URL stránky, normalizovaný kontakt | Porovnávat jen doložené údaje, chybějící informace z čtečky není důkaz absence |
| Struktura a odpovědi | Nadpisy, odpověď na otázku, odkazovatelná URL, textový obsah | Heuristická srozumitelnost není záruka kvality, pravdivosti nebo citace |
| Autorství a důkazy | Autor, datum, odkazy na primární zdroje a jejich původ | Rozpoznaný autor neprokazuje odbornost; datum znovu nepovažovat za aktuálnost |
| Citovatelnost | Stabilní URL, identita článku, titulek, autor/datum pokud doložené | Nejde o předpověď doporučování v AI |

Kontroly pracují pouze s načteným vzorkem. llms.txt může být informativní, jeho absence není důvodem ke snížení skóre. Google nevyžaduje speciální AI soubory ani speciální Schema.org pro AI Overviews / AI Mode.

## Návrh AI skóre 0–100 (zatím nezapnuto)

Verze návrhu `ai-technical-v0`. Váhy: deklarovaný přístup a indexovatelnost 30, strojově čitelná identita a strukturovaná data 25, struktura obsahu a odpovědi 20, doložitelnost a autorství 15, technická citovatelnost 10. Váhy jsou produktová metodika, nikoli algoritmus Googlu či OpenAI.

Každé pravidlo musí mít před zapnutím pevnou váhu, podmínky applicable, definici důkazu pro pass/fail a regresní fixture. Žádné LLM skórování bez doložitelných pravidel. Informační kontroly mají váhu 0. Přístup pro trénování nemá penalizaci.

`coverage = součet vah ověřených pravidel / součet vah relevantních pravidel`.
`score = 100 × součet(weight × points/100) / součet vah ověřených pravidel`.
Unknown se nepočítá jako fail; not_applicable se nezapočítá do jmenovatele. Bez měření score=null. Pod 70 % pokrytí nevydávat souhrnné AI skóre, jen dílčí kontroly a neověřený rozsah. Pokrytí a skóre zobrazovat odděleně. Historii porovnávat pouze při stejné metodice, vzorku a profilu.

U každého nálezu zobrazit: zjištění + důkaz, proč je významné, možný dopad, konkrétní postup opravy, prioritu P1/P2/P3 a jistotu. Technické skóre nikdy neoznačovat za pravděpodobnost doporučení.

## Měření skutečných AI odpovědí — ověřeno 13. 11. 2026

| Kanál | Možná oficiální integrace | Co smí výsledek tvrdit |
|---|---|---|
| OpenAI | Responses API + web_search a URL citations | Pozorování konkrétní API odpovědi; ne reprodukce uživatelského ChatGPT |
| Gemini | Gemini API + Grounding with Google Search, metadata citací | Pozorování odpovědi z API; ne Google AI Overviews, AI Mode ani celé spotřebitelské Gemini |
| Perplexity | Aktuální Agent API s web search; adaptér podle aktuálního schématu odpovědi | Pozorování API odpovědi a doložených zdrojů; ne automaticky spotřebitelské Perplexity. Nepřebírat zastaralou Sonar integraci |
| Google AI Overviews / AI Mode | Samostatné oficiální API pro reprodukci těchto odpovědí se v ověřených zdrojích nepodařilo doložit | Stav „Neměřeno“. Search Console reportuje souhrnné Web vyhledávání včetně AI funkcí; není to úplný seznam AI citací |

Zdroje:
- https://developers.openai.com/api/docs/guides/tools-web-search
- https://developers.openai.com/api/docs/bots
- https://ai.google.dev/gemini-api/docs/google-search
- https://github.com/perplexityai/api-cookbook
- https://github.com/perplexityai/api-platform-developers/blob/main/skills/migrate-sonar-to-agent-api/SKILL.md
- https://developers.google.com/search/docs/appearance/ai-features

Modely a podmínky se mění; před implementací adaptéru znovu ověřit oficiální dokumentaci. Nevolat placené endpointy jen kvůli návrhu architektury. Bez klíčů a rozpočtu zůstává měření vypnuté, bez zástupných výsledků.

Protokol: verzované dotazy a sada značek/aliasů, lokalita a jazyk, čas, shodné dotazy a parametry pro vlastní web a nejvýše tři soupeře. Rozlišit zmínku značky, odkaz v seznamu vyhledaných zdrojů a skutečnou citaci v odpovědi. Samotné search_results nejsou prokázaná citace. Ukládat raw evidence podle podmínek poskytovatele, chybějící anotace neodhadovat. Metriky vykazovat s počtem úspěšných odpovědí a neověřených běhů; žádná univerzální pozice v AI. Přímý brand substring není dostačující pro nejednoznačné názvy.

## Bezpečnost, náklady a automatizace

- Přímý backendový fetch: pouze HTTP(S), veřejné adresy; zákaz lokálních/privátních/link-local IP v IPv4 i IPv6, kontrola DNS a každého redirectu, ochrana před rebindingem, omezení portů, velikosti, času a počtu redirectů. Síťová egress kontrola vedle validace vstupu.
- Robots a pravidla poskytovatelů vyhodnocovat před získáním obsahu. Síťové selhání je unknown. Přesná UA pravidla konzultovat s dokumentací robota.
- Získaný HTML/JSON/LLM obsah nikdy nespouštět. Escapovat výstup. Webový obsah je nedůvěryhodný vstup, nesmí měnit systémové instrukce, povolené nástroje ani rozpočet LLM.
- Cache podle normalizovaného cíle, poskytovatele, zařízení, profilu, modelu, prompt hashe a metodiky. Zvlášť retrievedAt, measuredAt, expiresAt. Single-flight a idempotency key zamezí dvojím placeným běhům. Omezené retry s backoffem; kvóta přeruší další placené požadavky.
- Každý běh má rozpočet na zdroj i celý audit; neznámá cena vyžaduje limit požadavků/tokenů, nikoli odhad nulových nákladů.
- Kontakty jsou veřejné důkazy s minimální retencí; e-mail uživatele a placené reporty nesmí být součástí veřejné cache. Mazání historie i export uživatelských dat; oddělení tenantů, autorizace každého runId, žádné veřejné sdílení bez záměru uživatele.
- Monitoring: fronta s omezenou souběžností, opakování jen potřebných kontrol, normalizované změny a deduplikace upozornění; upozornění neposílat bez nastavení příjemce a souhlasu.

## Budoucí oprávnění (architektura, ne aktuální paywall)

Zdarma / PRO / Monitoring jsou capability profily, nikoli různé výpočty skóre. Návrh capabilities: basic_audit, technical_ai, evidence_export, pdf_export, competitor_limit (0–3), scheduled_runs, retention_days, notification_channels. Rozpočet vyhodnocuje server; zadaný plán v prohlížeči není oprávnění. Současné dostupné funkce se touto etapou neomezují.

## Nejbližší konkrétní kroky

1. Dokončit průchod UI + tisk a cache provenance v desktop/mobil CI na aktuálním commitu. Výsledky CI doložit, ne pouze napsat že test existuje.
2. Reálný běh s mobilním i desktopovým PageSpeed; pokud kvóta blokuje, provozní řešení přístupu a skutečný údaj o nákladech, bez obcházení limitů.
3. Po splnění release gate vyčlenit evidence rozhraní a zavést první AI technické kontroly robots/JSON-LD s důkazy, bez odhadovaných AI zmínek.
4. Zpřesnit a otestovat metodiku, teprve potom vydat AI skóre a backendové adaptéry měření viditelnosti.
