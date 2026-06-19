/* i18n.js
   Mecanismo de internacionalización:
   - Intenta cargar data/textos.json -> textos.json
   - Si falla, usa TRANSLATIONS (vacío por defecto)
   - Aplica traducciones a elementos con data-i18n, data-i18n-html, data-i18n-attr
   - Establece document.documentElement.lang y lanza evento 'langchange'
*/

(function () {
  'use strict';

  // Fallback vacío (si quieres puedes insertar aquí traducciones por defecto)
  let TRANSLATIONS = {};

  const TEXT_PATHS = ['data/textos.json', 'textos.json'];

  function log(...args) { console.info('[i18n]', ...args); }
  function warn(...args) { console.warn('[i18n]', ...args); }

  async function fetchJsonWithFallback(paths) {
    for (const p of paths) {
      const url = `${p}?t=${Date.now()}`; // cache-buster temporal
      try {
        const resp = await fetch(url, { cache: "no-store" });
        if (!resp.ok) {
          log(`No OK ${url} -> ${resp.status}`);
          continue;
        }
        const json = await resp.json();
        log('Loaded', url);
        return json;
      } catch (err) {
        warn(`Fetch error for ${url}:`, err && err.message ? err.message : err);
      }
    }
    throw new Error('No JSON available from candidates');
  }

  // Aplica traducciones al DOM
  function applyTranslations(lang, translations = TRANSLATIONS) {
    if (!translations || typeof translations !== 'object') {
      warn('No translations to apply');
      return;
    }

    // Helper para obtener valor por clave, soporta keys con puntos (e.g. "hero.title")
    function getByPath(obj, path) {
      if (!obj || !path) return undefined;
      const parts = path.split('.');
      let cur = obj;
      for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
      }
      return cur;
    }

    // Devuelve string traducido: si es objeto {es, en, fr} devuelve según lang
    function resolveValue(v) {
      if (v == null) return '';
      if (typeof v === 'string') return v;
      if (typeof v === 'object') {
        return v[lang] || v.es || Object.values(v)[0] || '';
      }
      return String(v);
    }

    // data-i18n => busca la clave completa en translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getByPath(translations, key);
      const out = resolveValue(val);
      if (out !== undefined) el.textContent = out;
    });

    // data-i18n-html => inyecta HTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = getByPath(translations, key);
      const out = resolveValue(val);
      if (out !== undefined) el.innerHTML = out;
    });

    // data-i18n-attr => JSON declarativo en el atributo: {"placeholder":"form.email_placeholder"}
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      try {
        const spec = JSON.parse(el.getAttribute('data-i18n-attr'));
        Object.entries(spec).forEach(([attr, key]) => {
          const val = getByPath(translations, key);
          const out = resolveValue(val);
          if (out !== undefined) el.setAttribute(attr, out);
        });
      } catch (e) {
        warn('Invalid JSON in data-i18n-attr for element', el, e);
      }
    });

    // Guarda elección e informa al resto
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    // Disparar evento para que otras partes (app.js) re-rendericen
    window.dispatchEvent(new Event('langchange'));
    log('Applied translations for', lang);
  }

  // Setea idioma manualmente
  function setLanguage(lang) {
    if (!lang) return;
    try {
      applyTranslations(lang, TRANSLATIONS);
    } catch (e) {
      warn('setLanguage error', e);
    }
  }

  // Inicialización
  (async function init() {
    const initialLang = localStorage.getItem('lang') ||
                        (navigator.language || 'es').split('-')[0] ||
                        'es';

    try {
      TRANSLATIONS = await fetchJsonWithFallback(TEXT_PATHS);
    } catch (err) {
      warn('Usando textos de respaldo (no se pudo leer data/textos.json ni textos.json).', err && err.message || err);
      // TRANSLATIONS se mantiene como fallback (vacío o lo que manualmente pongas arriba)
    }

    // Aplicar en primera carga
    try {
      applyTranslations(initialLang, TRANSLATIONS);
    } catch (e) {
      warn('Error aplicando traducciones iniciales:', e);
    }

    // Exponer API global simple
    window.i18n = {
      get translations() { return TRANSLATIONS; },
      setLanguage,
      getLanguage: () => localStorage.getItem('lang') || document.documentElement.getAttribute('lang') || initialLang
    };

    log('i18n inicializado, idioma:', window.i18n.getLanguage());
  })();

})();
