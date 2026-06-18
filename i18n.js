/* i18n — versión mejorada
 - Lee /data/textos.json?t=... (cache-bust)
 - Soporta JSON anidado (se aplana a claves_con_guion_bajo)
 - Sólo reemplaza si el valor es distinto (evita parpadeo)
 - Usa un fallback mínimo embebido si fetch falla
*/
(function () {
  'use strict';

  const DEFAULT_LANG = 'es';
  const LANGS = ['es','en','fr','pt'];

  // Fallback muy pequeño para evitar errores si no hay JSON (no mantener aquí textos editables)
  const FALLBACK = {
    es: { obra_precio: '[$ 000.000 COP]', nav_historia: 'Historia' },
    en: { obra_precio: '[$ 000 USD]', nav_historia: 'Story' },
    fr: { obra_precio: '[000 €]', nav_historia: 'Histoire' },
    pt: { obra_precio: '[R$ 0]', nav_historia: 'História' }
  };

  // util: aplana un objeto { a: { b: 'x' } } -> { 'a_b': 'x' }
  function flatten(obj, prefix = '', out = {}) {
    Object.keys(obj || {}).forEach((k) => {
      const val = obj[k];
      const key = prefix ? prefix + '_' + k : k;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        flatten(val, key, out);
      } else {
        out[key] = val;
      }
    });
    return out;
  }

  // Obtiene traducción del dict: primero revisa clave plana, si no, undefined.
  function getVal(dict, key) {
    if (!dict) return undefined;
    if (dict[key] !== undefined) return dict[key];
    return undefined;
  }

  // Aplica cambios al DOM de forma segura: sólo si hay diferencia.
  function applyTranslationsForLang(dict, lang) {
    if (!dict) dict = {};
    // Merge fallback (only for missing keys)
    const merged = Object.assign({}, FALLBACK[lang] || {}, dict);

    // Recolectar cambios -> aplicarlos en rAF para evitar layout thrash
    const changes = [];

    // data-i18n -> textContent
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = getVal(merged, key);
      if (val !== undefined && String(el.textContent).trim() !== String(val).trim()) {
        changes.push(() => { el.textContent = val; });
      }
    });

    // data-i18n-html -> innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const val = getVal(merged, key);
      if (val !== undefined && el.innerHTML !== String(val)) {
        changes.push(() => { el.innerHTML = val; });
      }
    });

    // data-i18n-attr -> "attr:key,attr2:key2"
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const raw = el.getAttribute('data-i18n-attr');
      raw.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        const val = getVal(merged, key);
        if (val !== undefined && el.getAttribute(attr) !== String(val)) {
          changes.push(() => { el.setAttribute(attr, String(val)); });
        }
      });
    });

    // title/meta special handling:
    if (merged.meta_title) {
      if (document.title !== merged.meta_title) changes.push(() => { document.title = merged.meta_title; });
    }
    if (merged.meta_description) {
      const md = document.querySelector('meta[name="description"]');
      if (md && md.getAttribute('content') !== merged.meta_description) {
        changes.push(() => md.setAttribute('content', merged.meta_description));
      }
    }

    // Apply all changes in one rAF
    if (changes.length) {
      requestAnimationFrame(() => {
        changes.forEach(fn => { try { fn(); } catch(e){} });
        // update lang attribute and active buttons
        try {
          document.documentElement.lang = lang;
          document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
            const is = btn.getAttribute('data-lang') === lang;
            btn.classList.toggle('is-active', is);
            btn.setAttribute('aria-pressed', String(is));
          });
        } catch(e){}
        // dispatch event so other scripts (app.js) can react
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
      });
    } else {
      // still set lang attribute and buttons even if no visible changes
      try {
        document.documentElement.lang = lang;
        document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
          const is = btn.getAttribute('data-lang') === lang;
          btn.classList.toggle('is-active', is);
          btn.setAttribute('aria-pressed', String(is));
        });
      } catch(e){}
    }
  }

  // Detect current language
  function detectLang() {
    try {
      const saved = localStorage.getItem('lang');
      if (saved && LANGS.includes(saved)) return saved;
    } catch(e){}
    const nav = (navigator.language || 'es').slice(0,2).toLowerCase();
    return LANGS.includes(nav) ? nav : DEFAULT_LANG;
  }

  // Global holder for loaded translations (flattened)
  const REMOTE = {}; // REMOTE[lang] = { key: val, ... }

  // Load remote JSON and flatten per language
  function loadRemoteAndApply(lang) {
    const url = '/data/textos.json?t=' + Date.now();
    fetch(url, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((json) => {
        // For each language present in json, flatten and store
        Object.keys(json || {}).forEach((l) => {
          if (json[l] && typeof json[l] === 'object') {
            REMOTE[l] = flatten(json[l]); // keys become like 'obra_precio'
          }
        });
        // If requested lang present apply it; otherwise fallback to DEFAULT_LANG
        const toApply = REMOTE[lang] || REMOTE[DEFAULT_LANG] || FALLBACK[lang] || {};
        applyTranslationsForLang(toApply, lang);
      })
      .catch((err) => {
        console.warn('[i18n] no se pudo leer /data/textos.json; usando fallback', err);
        const fallback = (FALLBACK[lang] || FALLBACK[DEFAULT_LANG] || {});
        applyTranslationsForLang(fallback, lang);
      });
  }

  // Public: set language (callable desde consola)
  window.setLanguage = function (lang) {
    if (!LANGS.includes(lang)) lang = DEFAULT_LANG;
    try { localStorage.setItem('lang', lang); } catch(e){}
    // If we already loaded remote translations and it has the lang, use it; otherwise load
    if (REMOTE[lang]) {
      applyTranslationsForLang(REMOTE[lang], lang);
    } else {
      loadRemoteAndApply(lang);
    }
  };

  // Hook buttons and initial load
  document.addEventListener('DOMContentLoaded', function () {
    // hookup language buttons
    document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const l = btn.getAttribute('data-lang');
        window.setLanguage(l);
      });
    });

    // detect and apply initial lang quickly:
    const lang = detectLang();
    // Try to apply local fallback immediately if exists (prevents empty UI)
    applyTranslationsForLang(FALLBACK[lang] || {}, lang);

    // load remote and override values when ready (non-blocking)
    loadRemoteAndApply(lang);
  });

})();
