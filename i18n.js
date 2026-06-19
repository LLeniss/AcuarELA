/**
 * i18n.js
 * - Intenta cargar data/textos.json (cache-busted).
 * - Si falla, usa TRANSLATIONS embebidas como fallback (Unicode-escaped para evitar problemas de encoding).
 * - Soporta atributos: data-i18n, data-i18n-html, data-i18n-attr (attr:key)
 *
 * Guardar como UTF-8. Colocar en la raíz donde lo referencia index.html.
 */
(function() {
  'use strict';

  // -----------------------
  // Fallback translations (es) — Unicode-escaped para evitar problemas de encoding en servidores con charset mal configurado.
  // -----------------------
  const TRANSLATIONS = {
    "es": {
      "meta_title": "Eduvina Parada C\u00e1ceres \u00b7 Artista de acuarela",
      "meta_desc": "Eduvina Parada C\u00e1ceres presenta su primera acuarela. Dona o reserva para apoyar su cuidado y su arte.",
      "nav_historia": "Historia",
      "nav_obra": "La obra",
      "nav_catalogo": "Cat\u00e1logo",
      "nav_ayudar": "C\u00f3mo ayudar",
      "nav_evento": "Evento",
      "nav_cta": "Donar",
      "hero_kicker": "Primera obra en exposici\u00f3n",
      "hero_title": "Ella es artista. Y esto reci\u00e9n empieza.",
      "hero_subtitle": "Eduvina Parada \u2014Vina\u2014 presenta su primera acuarela. Tu apoyo hace posible que siga creando.",
      "hero_btn_donar": "\u2764 Donar ahora",
      "hero_btn_comprar": "\ud83d\uddbc Reservar / comprar la obra",
      "hero_btn_compartir": "\u2197 Compartir",
      "historia_eyebrow": "Qui\u00e9n es Eduvina",
      "historia_title": "Una artista que encontr\u00f3 su voz en el color",
      "historia_p1": "Eduvina Parada C\u00e1ceres \u2014Vina\u2014, es una artista bumanguesa. En sus acuarelas, los materiales y las emociones se encuentran para crear luz e instantes de serenidad.",
      "historia_p2": "Vive con ELA bulbar, una condici\u00f3n progresiva que agota sus capacidades f\u00edsicas y afecta el habla y la degluci\u00f3n. Sin embargo, mantiene intactas sus capacidades cognitivas; pintar es su forma de comunicarse ahora que su cuerpo y sus palabras encuentran l\u00edmites.",
      "historia_p3": "El 19 de Junio de 2026 su obra se exhibe por primera vez. Este es solo un comienzo: cada acuarela que encuentra un hogar hace posible que Vina siga pintando y financiando los cuidados que su salud requiere.",
      "obra_eyebrow": "La obra",
      "obra_title": "Su primera acuarela a la venta",
      "obra_nombre": "Primera acuarela de Vina",
      "obra_ficha_tecnica_label": "T\u00e9cnica",
      "obra_ficha_tecnica": "Acuarela sobre papel de algod\u00f3n",
      "obra_ficha_medidas_label": "Medidas",
      "obra_ficha_anio_label": "A\u00f1o",
      "obra_ficha_estado_label": "Disponibilidad",
      "obra_ficha_estado": "Disponible",
      "obra_precio_label": "Precio / aporte sugerido",
      "catalogo_eyebrow": "Cat\u00e1logo",
      "catalogo_title": "Una colecci\u00f3n que crece",
      "donar_eyebrow": "Medio de donaci\u00f3n",
      "donar_title": "Dona por Bre\u2011B",
      "donar_breb_title": "Bre\u2011B",
      "donar_breb_num": "N\u00famero: <strong>315 542 7152</strong>",
      "fondos_eyebrow": "Transparencia",
      "fondos_title": "\u00bfA d\u00f3nde va tu aporte?",
      "fondos_1_title": "Tratamiento y terapias",
      "fondos_1_text": "Financiamos consultas, medicamentos y terapias necesarias para su cuidado.",
      "fondos_3_title": "Materiales y comunicaci\u00f3n",
      "fondos_3_text": "Materiales de arte y dispositivos de comunicaci\u00f3n que le permiten seguir creando y expres\u00e1ndose.",
      "evento_fecha_label": "Fecha",
      "evento_lugar_label": "Lugar",
      "faq_eyebrow": "Preguntas frecuentes",
      "faq_title": "Resolvemos tus dudas",
      "faq_q1": "\u00bfC\u00f3mo reservo o compro la obra?",
      "faq_q2": "\u00bfMi donaci\u00f3n llega directamente a Eduvina?",
      "contacto_title": "\u00bfHablamos?",
      "footer_copy": "Hecho con cari\u00f1o y esperanza."
    }
  };

  // -----------------------
  // Helpers
  // -----------------------
  function isObject(val) {
    return val && typeof val === 'object' && !Array.isArray(val);
  }

  // Get preferred language from localStorage or browser
  function detectLang() {
    const saved = localStorage.getItem('lang');
    if (saved) return saved;
    const nav = navigator.language || navigator.userLanguage || 'es';
    return nav.split('-')[0];
  }

  // Apply translations to DOM elements
  function applyTranslations(translations, lang) {
    if (!translations || !translations[lang]) {
      console.warn('[i18n] No translations for', lang);
      return;
    }
    const dict = translations[lang];

    // data-i18n => textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && dict[key] !== undefined) el.textContent = dict[key];
    });

    // data-i18n-html => innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key && dict[key] !== undefined) el.innerHTML = dict[key];
    });

    // data-i18n-attr => attr:key (e.g. alt:evento_flyer_alt)
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr'); // e.g. "alt:evento_flyer_alt"
      if (!spec) return;
      const parts = spec.split(':');
      if (parts.length < 2) return;
      const attr = parts[0];
      const key = parts.slice(1).join(':');
      if (dict[key] !== undefined) el.setAttribute(attr, dict[key]);
    });

    // Update document title if present
    const titleKey = 'meta_title';
    if (dict[titleKey]) document.title = dict[titleKey];
  }

  // Set language (exposed on window)
  function applyLang(lang, translations) {
    lang = (lang || detectLang()).slice(0,2);
    localStorage.setItem('lang', lang);
    applyTranslations(translations, lang);
    console.info('[i18n] applied language:', lang);
  }

  // -----------------------
  // Load textos.json with cache-buster
  // -----------------------
  var JSON_PATH = 'data/textos.json';

  function fetchTranslations() {
    const url = JSON_PATH + '?t=' + Date.now();
    console.info('[i18n] fetching translations from', url);
    return fetch(url, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(json => {
        if (!isObject(json)) throw new Error('Invalid JSON structure');
        console.info('[i18n] loaded translations from JSON');
        return json;
      });
  }

  // Public helper to force reload translations (useful for debugging)
  window.i18nForceReload = function() {
    // remove saved lang so detection re-runs (optional)
    localStorage.removeItem('lang');
    // try fetch again and re-apply
    fetchTranslations()
      .then(json => {
        window.setLanguage = function(l) { applyLang(l, json); };
        applyLang(detectLang(), json);
        console.info('[i18n] forced reload complete');
      })
      .catch(err => {
        console.warn('[i18n] forced reload failed, using fallback:', err.message);
        window.setLanguage = function(l) { applyLang(l, TRANSLATIONS); };
        applyLang(detectLang(), TRANSLATIONS);
      });
  };

  // Initialize: try fetch, otherwise fallback
  document.addEventListener('DOMContentLoaded', function() {
    var translations = null;
    fetchTranslations()
      .then(json => {
        translations = json;
      })
      .catch(err => {
        console.warn('[i18n] Usando textos de respaldo (no se pudo leer ' + JSON_PATH + '):', err.message);
        translations = TRANSLATIONS;
      })
      .finally(() => {
        if (!translations) translations = TRANSLATIONS;
        window.setLanguage = function(l) { applyLang(l, translations); };
        applyLang(detectLang(), translations);
        console.info('[i18n] ready. current language:', detectLang());
      });
  });

})();
