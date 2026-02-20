/* Domain checker – WebAO (WEDOS) */
/* - Fetch API
   - Validace vstupu (bez mezer, diakritiky, www, http/https)
   - Volání zabezpečené proxy /api/domain-check (Cloudflare Worker)
   - Demo fallback pokud API spadne / limit
*/

(() => {
  let lastBase = '';
  const elName = document.getElementById('dcName');
  const elBtn = document.getElementById('dcBtn');
  const elStatus = document.getElementById('dcStatus');
  const elResults = document.getElementById('dcResults');

  if (!elName || !elBtn || !elStatus || !elResults) return;

  const API_URL = '/api/domain-check'; // Cloudflare Worker route

  // Affiliate (WEDOS) – doplň svoje ID z wedos.as
  // Affiliate ID z tvého odkazu
  const WEDOS_AFFILIATE_ID = 'jzKMbf';

  function getWedosAffiliateUrl(fqdn){
    // pokud nechceš affiliate, můžeš vrátit přímo WEDOS url bez parametru
    // return `https://www.wedos.cz/registrace-domeny/?domain=${encodeURIComponent(fqdn)}`;
    // Používáme tvůj reálný affiliate link (vedos.cz)
    return `https://vedos.cz/domeny/?ap=${encodeURIComponent(WEDOS_AFFILIATE_ID)}&domain=${encodeURIComponent(fqdn)}`;
  }

  // vždy kontrolujeme všechny koncovky (uživatel nechce výběr)
  const DEFAULT_TLDS = ['cz', 'com', 'eu'];

  // --- UI helpers
  function setLoading(on) {
    if (on) {
      elBtn.disabled = true;
      elStatus.innerHTML = `<span class="dc-spinner" aria-hidden="true"></span> Ověřuji…`;
    } else {
      elBtn.disabled = false;
      elStatus.textContent = '';
    }
  }

  function clearResults() {
    elResults.innerHTML = '';
  }

  function renderResult({ fqdn, status, message, source }) {
    const cls =
      status === 'free' ? 'dc-ok' :
      status === 'taken' ? 'dc-no' : 'dc-warn';

    const badge =
      status === 'free' ? '✅' :
      status === 'taken' ? '❌' : '⚠️';

    // Zdroj do UI netlačíme (ruší design) – necháme ho jen pro debug.
    const div = document.createElement('div');
    div.className = `dc-result ${cls}`;
    if (source) div.dataset.source = String(source);

    // Akce: pro volnou doménu 2 CTA (primární registrace, sekundární web)
    // Pro obsazenou doménu nabídneme rychlé návrhy (klik → přepíše input a ověří).
    let actions = '';

    if (status === 'free') {
      actions = `
        <div class="dc-actions" style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
          <a
            class="dc-cta dc-cta--primary"
            href="${getWedosAffiliateUrl(fqdn)}"
            target="_blank"
            rel="noopener"
            aria-label="Registrovat doménu ${escapeHtml(fqdn)}"
            style="display:inline-flex;align-items:center;justify-content:center;padding:.55rem .95rem;border-radius:999px;background:var(--blue,#0033cc);color:#fff;font-weight:900;white-space:nowrap;box-shadow:0 10px 22px rgba(0,0,0,.10);border:1px solid rgba(0,0,0,.04);transition:.2s ease"
          >Registrovat doménu</a>
          <a
            class="dc-cta dc-cta--secondary"
            href="#kontakt"
            aria-label="Chci web k doméně ${escapeHtml(fqdn)}"
            style="display:inline-flex;align-items:center;justify-content:center;padding:.55rem .95rem;border-radius:999px;background:rgba(0,51,204,.06);color:var(--blue,#0033cc);font-weight:900;white-space:nowrap;border:1px solid rgba(0,51,204,.18);transition:.2s ease"
          >Chci web</a>
        </div>
      `;
    } else if (status === 'taken') {
      const sugg = getNameSuggestions(lastBase);
      const chips = sugg.map(s => {
        return `
          <button
            type="button"
            class="dc-sugg"
            data-sugg="${escapeHtml(s)}"
            style="appearance:none;border:1px solid #e9eef8;background:#fff;border-radius:999px;padding:.38rem .7rem;font-weight:900;color:#1a2f70;cursor:pointer;transition:.2s ease"
            aria-label="Zkusit název ${escapeHtml(s)}"
          >${escapeHtml(s)}</button>
        `;
      }).join('');

      actions = `
        <div class="dc-actions" style="display:flex;flex-direction:column;align-items:flex-end;gap:.35rem">
          <div style="font-size:.85rem;color:var(--ink-40,#5b6b8f);font-weight:800">Zkus jiný název:</div>
          <div class="dc-suggs" style="display:flex;gap:.45rem;flex-wrap:wrap;justify-content:flex-end">${chips}</div>
        </div>
      `;
    }

    div.innerHTML = `
      <div class="dc-result__left">
        <span class="dc-badge" aria-hidden="true">${badge}</span>
        <div style="min-width:0">
          <div class="dc-domain">${escapeHtml(fqdn)}</div>
          <div class="dc-meta">${escapeHtml(message || '')}</div>
        </div>
      </div>
      ${actions}
    `;

    // Klik na návrh přepíše input a spustí ověření
    div.querySelectorAll('button.dc-sugg').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.getAttribute('data-sugg') || '';
        elName.value = v;
        run();
      });
      btn.addEventListener('mouseenter', () => btn.style.transform = 'translateY(-1px)');
      btn.addEventListener('mouseleave', () => btn.style.transform = 'translateY(0)');
    });

    // Hover efekty pro CTA (bez dalšího CSS)
    div.querySelectorAll('a.dc-cta--primary').forEach(a => {
      a.addEventListener('mouseenter', () => a.style.transform = 'translateY(-2px)');
      a.addEventListener('mouseleave', () => a.style.transform = 'translateY(0)');
    });
    div.querySelectorAll('a.dc-cta--secondary').forEach(a => {
      a.addEventListener('mouseenter', () => a.style.transform = 'translateY(-2px)');
      a.addEventListener('mouseleave', () => a.style.transform = 'translateY(0)');
    });

    elResults.appendChild(div);
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // --- Input sanitization / validation
  function sanitizeBaseDomain(input) {
    let s = String(input || '').trim();

    // remove protocol & www
    s = s.replace(/^https?:\/\//i, '');
    s = s.replace(/^www\./i, '');

    // if user pasted full domain, take first label (before first dot)
    if (s.includes('.')) s = s.split('.')[0];

    // strip spaces
    s = s.replace(/\s+/g, '');

    // remove diacritics
    s = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');

    // lowercase
    s = s.toLowerCase();

    // allow only a-z 0-9 hyphen
    s = s.replace(/[^a-z0-9-]/g, '');

    // trim hyphens
    s = s.replace(/^-+/, '').replace(/-+$/, '');

    return s;
  }

  function isValidBaseDomain(s) {
    if (!s) return false;
    if (s.length < 1 || s.length > 63) return false;
    // '--' je technicky povolené, jen to necháváme projít
    return true;
  }

  function getSelectedTlds() {
    // výběr jsme z UI odstranili → kontrolujeme vždy vše
    return [...DEFAULT_TLDS];
  }

  function getNameSuggestions(base) {
    const b = String(base || '').trim();
    if (!b) return [];

    // krátké a praktické varianty
    const list = [
      `${b}-cz`,
      `${b}-web`,
      `${b}web`,
      `${b}online`,
      `my${b}`
    ];

    // unikátní + max 5
    const uniq = [];
    for (const x of list) {
      if (!uniq.includes(x) && x.length <= 63) uniq.push(x);
      if (uniq.length >= 5) break;
    }
    return uniq;
  }

  // --- Demo fallback (když WEDOS API nejede / limit)
  function demoFallback(base, tlds, reason = 'API nedostupné – demo režim') {
    elStatus.textContent = reason;
    clearResults();

    tlds.forEach(tld => {
      const fqdn = `${base}.${tld}`;
      const available = pseudoAvailability(`${base}.${tld}`);
      renderResult({
        fqdn,
        status: available ? 'free' : 'taken',
        message: available ? 'Doména je volná (demo)' : 'Doména je obsazená (demo)',
        source: 'DEMO'
      });
    });
  }

  function pseudoAvailability(seed) {
    // deterministické pseudo-random podle textu, ať se to nechová chaoticky
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // ~55% obsazeno (typicky realističtější)
    return (h >>> 0) % 100 >= 55;
  }

  // --- WEDOS proxy call
  async function checkDomains(base, tlds) {
    const qs = new URLSearchParams();
    qs.set('name', base);
    qs.set('tlds', tlds.join(','));

    const res = await fetch(`${API_URL}?${qs.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    // 429/5xx => fallback
    if (!res.ok) {
      const txt = await safeText(res);
      throw new Error(`Proxy chyba (${res.status}): ${txt || res.statusText}`);
    }

    const data = await res.json();
    if (!data || data.ok !== true || !Array.isArray(data.results)) {
      throw new Error('Neplatná odpověď proxy.');
    }
    return data;
  }

  async function safeText(res) {
    try { return await res.text(); } catch { return ''; }
  }

  function mapStatusToText(status, code) {
    if (status === 'free') return 'Doména je volná';
    if (status === 'taken') return 'Doména je obsazená';
    return code ? `Chyba / omezení (kód ${code})` : 'Chyba / omezení';
  }

  async function run() {
    // uložíme pro návrhy

    const base = sanitizeBaseDomain(elName.value);
    lastBase = base;
    const tlds = getSelectedTlds();

    elName.value = base;

    clearResults();

    if (!isValidBaseDomain(base)) {
      elStatus.textContent = 'Zadej platný název (bez mezer, diakritiky, www, http).';
      return;
    }

    setLoading(true);

    try {
      const out = await checkDomains(base, tlds);
      setLoading(false);
      elStatus.textContent = '';

      clearResults();

      out.results.forEach(r => {
        renderResult({
          fqdn: r.fqdn,
          status: r.status,
          message: mapStatusToText(r.status, r.code),
          source: r.source || 'WEDOS'
        });
      });

      if (out.demo === true) {
        elStatus.textContent = '⚠️ WEDOS API nedostupné – zobrazen demo výsledek.';
      }

    } catch (err) {
      setLoading(false);
      demoFallback(base, tlds, `⚠️ ${String(err?.message || 'Chyba API')} — demo režim`);
    }
  }

  // Click + Enter
  elBtn.addEventListener('click', run);
  elName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  });
})();
