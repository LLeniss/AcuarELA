(function () {
  'use strict';

  const WHATSAPP_NUMBER = '573155427152';
  const CACHE_BUST = Date.now();

  // Fallback mínimo por si no carga JSON
  const FALLBACK = {
    "es": {
      "meta_title": "Eduvina Parada Cáceres · Su primera obra",
      "site_name": "Eduvina Parada Cáceres",
      "hero_title": "Vina - artista de acuarELA",
      "obra_nombre": "Armonía en la naturaleza",
      "whatsapp_reserve_msg": "Hola, quiero reservar la obra \"{title}\". ¿Me indican el proceso, por favor? Mi correo: vinapc2611@gmail.com",
      "contact_email": "vinapc2611@gmail.com",
      "contact_whatsapp_text": "315 542 7152"
    }
  };

  let translations = FALLBACK;

  function getT(lang, key) {
    return (translations[lang] && translations[lang][key]) || (FALLBACK['es'] && FALLBACK['es'][key]) || '';
  }

  function applyTranslations(lang) {
    // textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const v = getT(lang, key);
      if (v !== '') el.textContent = v;
    });

    // innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const v = getT(lang, key);
      if (v !== '') el.innerHTML = v;
    });

    // attributes: format "attr:key;attr2:key2"
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        const v = getT(lang, key);
        if (attr && key && v !== '') el.setAttribute(attr, v);
      });
    });

    // reserve buttons: place data-title and attach handler
    document.querySelectorAll('[data-reserve]').forEach(btn => {
      const key = btn.getAttribute('data-reserve-title-key');
      const title = key ? getT(lang, key) : '';
      btn.setAttribute('data-title', title);
      btn.onclick = function (e) {
        e.preventDefault();
        const t = btn.getAttribute('data-title') || '';
        const tpl = getT(lang, 'whatsapp_reserve_msg') || FALLBACK['es']['whatsapp_reserve_msg'];
        const msg = tpl.replace('{title}', t);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      };
    });

    // share handlers
    document.querySelectorAll('[data-share]').forEach(el => {
      el.onclick = function (e) {
        e.preventDefault();
        const text = getT(lang, 'hero_title') || document.title;
        const shareData = { title: document.title, text: text, url: location.href };
        if (navigator.share) {
          navigator.share(shareData).catch(() => {});
        } else {
          window.prompt('Copia este enlace para compartir:', location.href);
        }
      };
    });

    // active lang UI
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });

    // meta tags
    const mt = getT(lang, 'meta_title');
    if (mt) document.title = mt;
    const md = getT(lang, 'meta_desc');
    if (md) {
      document.querySelectorAll('meta[name="description"]').forEach(m => m.setAttribute('content', md));
    }

    localStorage.setItem('lang', lang);
    console.log('[i18n] applied', lang);
  }

  function initLangButtons() {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', function () {
        const chosen = btn.getAttribute('data-lang');
        applyTranslations(chosen);
      });
    });
  }

  function loadJSONAndInit() {
    const url = `data/textos.json?t=${CACHE_BUST}`;
    fetch(url, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(data => {
        translations = data;
        const initial = localStorage.getItem('lang') || detectLang();
        initLangButtons();
        applyTranslations(initial);
        console.log('[i18n] Loaded data/textos.json (ok)');
      })
      .catch(err => {
        console.warn('[i18n] Could not load data/textos.json, using fallback. Error:', err);
        const initial = localStorage.getItem('lang') || detectLang();
        initLangButtons();
        applyTranslations(initial);
      });
  }

  function detectLang() {
    const nav = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
    if (nav.indexOf('fr') === 0) return 'fr';
    if (nav.indexOf('en') === 0) return 'en';
    return 'es';
  }

  window.addEventListener('DOMContentLoaded', loadJSONAndInit);
})();
