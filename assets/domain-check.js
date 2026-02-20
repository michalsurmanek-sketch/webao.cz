/* Domain checker – WebAO (WEDOS) */
/* - Fetch API
   - Validace vstupu (bez mezer, diakritiky, www, http/https)
   - Volání zabezpečené proxy /api/domain-check (Cloudflare Worker)
   - Demo fallback pokud API spadne / limit
*/

(() => {
  const elName = document.getElementById('dcName');
  const elBtn = document.getElementById('dcBtn');
  const elStatus = document.getElementById('dcStatus');
  const elResults = document.getElementById('dcResults');

  if (!elName || !elBtn || !elStatus || !elResults) return;

  const API_URL = '/api/domain-check'; // Cloudflare Worker route

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

    const meta = source ? `Zdroj: ${source}` : '';

    const div = document.createElement('div');
    div.className = `dc-result ${cls}`;
    div.innerHTML = `
      <div class="dc-result__left">
        <span class="dc-badge" aria-hidden="true">${badge}</span>
        <div style="min-width:0">
          <div class="dc-domain">${escapeHtml(fqdn)}</div>
          <div class="dc-meta">${escapeHtml(message || '')}</div>
        </div>
      </div>
      <div class="dc-note">${escapeHtml(meta)}</div>
    `;
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
    const base = sanitizeBaseDomain(elName.value);
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
