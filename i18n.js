// i18n.js
// Módulo i18n ligero con fetch a data/textos.json (cache-buster), fallback embebido y dispatch de 'langchange'.
// Ajustes: mejor logging, response.ok check, setAttribute('lang'), dispatchEvent('langchange').

(function () {
  'use strict';

  // --- FALLBACK de seguridad (vacío o mínimo) ---
  const TRANSLATIONS = {
    // Si ya tienes un objeto grande embebido en la versión anterior, pégalo aquí.
    // Por simplicidad dejamos un fallback mínimo; el fetch debería traer data/textos.json real.
  };

  // Utilidades
  function safeLog(...args) {
    if (window.console && window.console.log) console.log.apply(console, args);
  }
  function safeWarn(...args) {
    if (window.console && window.console.warn) console.warn.apply(console, args);
  }

  // Estado
  let TEXTS = TRANSLATIONS;
  let currentLoaded = false;

  // Intenta cargar data/textos.json con cache-buster
  async function loadTexts() {
    const url = `data/textos.json?t=${Date.now()}`;
    safeLog('[i18n] Fetching', url);
    try {
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) {
        safeWarn('[i18n] fetch failed, status:', resp.status, resp.statusText);
        return false;
      }
      const json = await resp.json();
      TEXTS = json;
      currentLoaded = true;
      safeLog('[i18n] textos.json cargado correctamente (live)');
      return true;
    } catch (err) {
      safeWarn('[i18n] error cargando textos:', err);
      return false;
    }
  }

  // Helpers para aplicar traducciones
  function getNested(obj, path) {
    return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  }
  function applyTextToNode(node, key, lang) {
    try {
      const val = getNested(TEXTS, key);
      if (val === undefined) return false;
      // Si val es objeto con lenguas: { es: "...", en: "..."}
      if (typeof val === 'object' && val !== null) {
        const out = val[lang] || val.es || Object.values(val)[0] || '';
        if (node.hasAttribute('data-i18n-html')) node.innerHTML = out;
        else node.textContent = out;
        return true;
      }
      // si es string directo
      if (typeof val === 'string') {
        if (node.hasAttribute('data-i18n-html')) node.innerHTML = val;
        else node.textContent = val;
        return true;
      }
    } catch (e) {
      safeWarn('[i18n] applyTextToNode error', e);
    }
    return false;
  }

  // Aplica traducciones sobre DOM conforme a atributos data-i18n*
  function applyTranslations(lang) {
    try {
      if (!TEXTS) TEXTS = TRANSLATIONS;
      const nodes = document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-attr]');
      nodes.forEach(node => {
        // data-i18n (clave)
        const key = node.getAttribute('data-i18n');
        if (key) {
          const ok = applyTextToNode(node, key, lang);
          if (!ok) {
            // fallback: deja lo que haya (no sobreescribimos si no existe)
          }
        }
        // data-i18n-html (forzar html)
        const keyHtml = node.getAttribute('data-i18n-html');
        if (keyHtml) {
          applyTextToNode(node, keyHtml, lang);
        }
        // data-i18n-attr: formato "attrName:clave"
        const keyAttr = node.getAttribute('data-i18n-attr');
        if (keyAttr) {
          // puede contener múltiples separados por ;
          keyAttr.split(';').forEach(pair => {
            const [attr, k] = pair.split(':').map(s => s && s.trim());
            if (attr && k) {
              const val = getNested(TEXTS, k);
              if (typeof val === 'object' && val !== null) {
                node.setAttribute(attr, val[lang] || val.es || Object.values(val)[0] || '');
              } else if (typeof val === 'string') {
                node.setAttribute(attr, val);
              }
            }
          });
        }
      });

      // Guardar elección y propagar
      localStorage.setItem('lang', lang);
      // --- ADICIONES IMPORTANTES ---
      document.documentElement.setAttribute('lang', lang);
      // Notificar a otras partes de la app que el idioma cambió
      window.dispatchEvent(new Event('langchange'));

      safeLog('[i18n] applied translations for', lang);
    } catch (e) {
      safeWarn('[i18n] applyTranslations error', e);
    }
  }

  // Detectar idioma preferido
  function detectLang() {
    const stored = localStorage.getItem('lang');
    if (stored) return stored;
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang) return htmlLang.split('-')[0];
    const nav = (navigator.language || navigator.userLanguage || 'es').split('-')[0];
    return nav || 'es';
  }

  // Public API: setLanguage
  function setLanguage(lang) {
    if (!lang) return;
    applyTranslations(lang);
  }

  // Inicialización: load textos, aplicar idioma detectado
  async function init() {
    const ok = await loadTexts();
    if (!ok) {
      safeWarn('[i18n] Usando textos de respaldo (no se pudo leer data/textos.json)');
      TEXTS = TRANSLATIONS || {};
    }
    const lang = detectLang();
    applyTranslations(lang);
  }

  // Exponer funciones mínimas
  window.i18n = {
    init,
    setLanguage,
    get texts() { return TEXTS; },
    get current() { return detectLang(); }
  };

  // Arranque en DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
