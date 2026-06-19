/**
 * i18n.js
 * - Intenta cargar data/textos.json (cache-busted).
 * - Si falla, usa TRANSLATIONS embebidas como fallback.
 * - Soporta atributos: data-i18n, data-i18n-html, data-i18n-attr (attr:key)
 *
 * Coloca este archivo en la raíz donde lo referencia index.html (ej: /i18n.js).
 */

(function() {
  'use strict';

  // -----------------------
  // Fallback translations (es: básico). Puedes ampliar según necesites.
  // -----------------------
  const TRANSLATIONS = {
    "es": {
      "meta_title": "Eduvina Parada Cáceres · Artista de acuarela",
      "meta_desc": "Eduvina Parada Cáceres presenta su primera acuarela. Dona o reserva para apoyar su cuidado y su arte.",
      "nav_historia": "Historia",
      "nav_obra": "La obra",
      "nav_catalogo": "Catálogo",
      "nav_ayudar": "Cómo ayudar",
      "nav_evento": "Evento",
      "nav_cta": "Donar",
      "hero_kicker": "Primera obra en exposición",
      "hero_title": "Ella es artista. Y esto recién empieza.",
      "hero_subtitle": "Eduvina Parada —Vina— presenta su primera acuarela. Tu apoyo hace posible que siga creando.",
      "hero_btn_donar": "❤ Donar ahora",
      "hero_btn_comprar": "🖼 Reservar / comprar la obra",
      "hero_btn_compartir": "↗ Compartir",
      "historia_eyebrow": "Quién es Eduvina",
      "historia_title": "Una artista que encontró su voz en el color",
      "historia_p1": "Eduvina Parada Cáceres —Vina—, es una artista bumanguesa. En sus acuarelas, los materiales y las emociones se encuentran para crear luz e instantes de serenidad.",
      "historia_p2": "Vive con ELA bulbar, una condición progresiva que agota sus capacidades físicas y afecta el habla y la deglución. Sin embargo, mantiene intactas sus capacidades cognitivas; pintar es su forma de comunicarse ahora que su cuerpo y sus palabras encuentran límites.",
      "historia_p3": "El 19 de Junio de 2026 su obra se exhibe por primera vez. Este es solo un comienzo: cada acuarela que encuentra un hogar hace posible que Vina siga pintando y financiando los cuidados que su salud requiere.",
      "obra_eyebrow":"La obra",
      "obra_title":"Su primera acuarela a la venta",
      "obra_lead":"",
      "obra_nombre":"[Título]",
      "obra_ficha_tecnica_label":"Técnica",
      "obra_ficha_tecnica":"",
      "obra_ficha_medidas_label":"Medidas",
      "obra_ficha_medidas":"",
      "obra_ficha_anio_label":"Año",
      "obra_ficha_anio":"",
      "obra_ficha_estado_label":"Disponibilidad",
      "obra_ficha_estado":"Disponible",
      "obra_precio_label":"Precio / aporte sugerido",
      "obra_precio":"",
      "obra_btn":"Reservar esta obra",
      "obra_nota":"",
      "catalogo_eyebrow":"Catálogo",
      "catalogo_title":"Una colección que crece",
      "catalogo_lead":"",
      "ayudar_eyebrow":"3 formas de ayudar",
      "ayudar_title":"Elige cómo acompañar este camino",
      "ayudar_1_title":"Donar",
      "ayudar_1_text":"Aporta lo que puedas para su cuidado y su arte.",
      "ayudar_1_btn":"Donar por Bre-B",
      "ayudar_2_title":"Reservar",
      "ayudar_2_text":"Reserva una obra y apoya su proyecto.",
      "ayudar_2_btn":"Ver obra",
      "ayudar_3_title":"Compartir",
      "ayudar_3_text":"Comparte este proyecto para ampliar la red de apoyo.",
      "ayudar_3_btn":"Compartir",
      "donar_eyebrow":"Medio de donación",
      "donar_title":"Dona por Bre‑B",
      "donar_lead":"Tu aporte llega directamente al bienestar de Eduvina. Gracias por apoyar su cuidado y su arte.",
      "donar_breb_title":"Bre‑B",
      "donar_breb_num":"Número: <strong>315 542 7152</strong>",
      "donar_breb_name":"A nombre de Eduvina Parada",
      "fondos_eyebrow":"Transparencia",
      "fondos_title":"¿A dónde va tu aporte?",
      "fondos_1_title":"Tratamiento y terapias",
      "fondos_1_text":"Financiamos consultas, medicamentos y terapias necesarias para su cuidado.",
      "fondos_2_title":"Cuidado diario",
      "fondos_2_text":"Apoyo en alimentación, movilización y atención domiciliaria.",
      "fondos_3_title":"Materiales y comunicación",
      "fondos_3_text":"Materiales de arte y dispositivos de comunicación que le permiten seguir creando y expresándose.",
      "fondos_4_title":"Transporte y logística",
      "fondos_4_text":"Traslados a citas médicas y logística asociada a exposiciones y entregas.",
      "evento_eyebrow":"El evento",
      "evento_title":"Exposición pública",
      "evento_lead":"",
      "evento_fecha_label":"Fecha",
      "evento_fecha":"19 de Junio de 2026",
      "evento_lugar_label":"Lugar",
      "evento_lugar":"Museo Casa Galán, Bucaramanga",
      "evento_flyer_alt":"Flyer del evento de exposición de Eduvina Parada Cáceres",
      "faq_eyebrow":"Preguntas frecuentes",
      "faq_title":"Resolvemos tus dudas",
      "faq_q1":"¿Cómo reservo o compro la obra?",
      "faq_a1":"Escríbenos por WhatsApp usando el botón \"Reservar\" y te indicamos el proceso.",
      "faq_q2":"¿Mi donación llega directamente a Eduvina?",
      "faq_a2":"Sí. Todos los aportes se destinan a su tratamiento, materiales y movilidad.",
      "contacto_eyebrow":"Contacto",
      "contacto_title":"¿Hablamos?",
      "contacto_lead":"Para reservas, compras o preguntas escribe al correo o por WhatsApp.",
      "contacto_email_label":"Correo",
      "contacto_wa_label":"WhatsApp",
      "contacto_email":"vinapc2611@gmail.com",
      "footer_copy":"Hecho con cariño y esperanza."
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

  // Apply translations to DOM
  function applyTranslations(translations, lang) {
    if (!translations || !translations[lang]) {
      console.warn('[i18n] No translations for', lang);
      return;
    }
    const dict = translations[lang];

    // data-i18n: textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && dict[key] !== undefined) el.textContent = dict[key];
    });

    // data-i18n-html: innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key && dict[key] !== undefined) el.innerHTML = dict[key];
    });

    // data-i18n-attr: "attr:key" (e.g. alt:some_key or content:meta_desc)
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr'); // e.g. "alt:evento_flyer_alt"
      if (!spec) return;
      const parts = spec.split(':');
      if (parts.length < 2) return;
      const attr = parts[0];
      const key = parts.slice(1).join(':');
      if (dict[key] !== undefined) el.setAttribute(attr, dict[key]);
    });

    // meta description (data-i18n-attr handled above if present)
    // update title if present
    const titleKey = 'meta_title';
    if (dict[titleKey]) document.title = dict[titleKey];
  }

  // Exposed function to set language
  function applyLang(lang, translations) {
    lang = (lang || detectLang()).slice(0,2);
    localStorage.setItem('lang', lang);
    applyTranslations(translations, lang);
    console.log('[i18n] applied language:', lang);
  }

  // -----------------------
  // Load textos.json with cache-buster
  // -----------------------
  const JSON_PATH = 'data/textos.json';

  function fetchTranslations() {
    const url = JSON_PATH + '?t=' + Date.now();
    console.info('[i18n] fetching translations from', url);
    return fetch(url, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(json => {
        // Expecting object like { "es": {..}, "en": {...}, "fr": {...} }
        if (!isObject(json)) throw new Error('Invalid JSON structure');
        console.info('[i18n] loaded translations from JSON');
        return json;
      });
  }

  // Initialize: try fetch, otherwise fallback to TRANSLATIONS
  document.addEventListener('DOMContentLoaded', function() {
    let translations = null;
    fetchTranslations()
      .then(json => {
        translations = json;
      })
      .catch(err => {
        console.warn('[i18n] Usando textos de respaldo (no se pudo leer ' + JSON_PATH + '):', err.message);
        translations = TRANSLATIONS;
      })
      .finally(() => {
        const lang = detectLang();
        // If translations is an object with language keys nested under a root, use as-is.
        // If the JSON uses structure like { es: {...}, en: {...} } that's expected.
        if (!translations) translations = TRANSLATIONS;
        window.setLanguage = function(l) { applyLang(l, translations); };
        applyLang(lang, translations);

        // small diagnostic flag
        console.info('[i18n] ready. current language:', lang);
      });
  });
})();
