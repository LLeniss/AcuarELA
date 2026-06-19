/**
 * i18n.js - carga data/textos.json?t=TIMESTAMP (cache-busted) y aplica traducciones.
 * - Soporta data-i18n, data-i18n-html, data-i18n-attr ("attr:key").
 * - Maneja selector de idioma [data-lang].
 * - Añade handlers para:
 *    - [data-reserve] -> abre WhatsApp con mensaje pre-llenado (usa data-reserve-title-key para título)
 *    - [data-share] -> Web Share o fallback
 */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '573155427152'; // formato internacional (sin +)

  // Fallback (mínimo). El archivo data/textos.json debe tener todo.
  const TRANSLATIONS = {
    "es": {
      "meta_title": "Eduvina Parada Cáceres · Su primera obra",
      "meta_desc": "Eduvina Parada —Vina— presenta su primera acuarela. Tu aporte ayuda a financiar su cuidado y su arte.",
      "site_name": "Eduvina Parada Cáceres",
      "hero_kicker": "Primera obra en exposición",
      "hero_title": "Ella es artista. Y esto recién empieza.",
      "hero_subtitle": "Eduvina Parada —Vina— presenta su primera acuarela. Tu apoyo hace posible que siga creando.",
      "hero_btn_donar": "❤ Donar ahora",
      "hero_btn_reservar": "🖼 Reservar / comprar",
      "obra_nombre": "Su primera acuarela",
      "whatsapp_reserve_msg": "Hola, quiero reservar la obra \"{title}\". ¿Me indican el proceso, por favor? Mi correo: vinapc2611@gmail.com",
      "contact_email": "vinapc2611@gmail.com",
      "contact_whatsapp_text": "315 542 7152",
      "contact_whatsapp_href": "https://wa.me/573155427152"
    }
  };

  let translations = TRANSLATIONS;

  function t(lang, key) {
    return (translations[lang] && translations[lang][key]) || (TRANSLATIONS['es'] && TRANSLATIONS['es'][key]) || '';
  }

  function applyTranslations(lang) {
    try {
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        const v = t(lang, key);
        if (v !== '') el.textContent = v;
      });

      document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
        const key = el.getAttribute('data-i18n-html');
        const v = t(lang, key);
        if (v !== '') el.innerHTML = v;
      });

      document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
        const spec = el.getAttribute('data-i18n-attr');
        spec.split(';').forEach(function (pair) {
          const parts = pair.split(':');
          if (parts.length === 2) {
            const attrName = parts[0].trim();
            const key = parts[1].trim();
            const v = t(lang, key);
            if (v !== '') el.setAttribute(attrName, v);
          }
        });
      });

      const mt = t(lang, 'meta_title');
      if (mt) document.title = mt;
      const md = t(lang, 'meta_desc');
      if (md) {
        document.querySelectorAll('meta[name="description"]').forEach(m => m.setAttribute('content', md));
      }

      // set data-title for reserve buttons from data-reserve-title-key
      document.querySelectorAll('[data-reserve]').forEach(function (btn) {
        const k = btn.getAttribute('data-reserve-title-key');
        if (k) {
          const title = t(lang, k) || '';
          btn.setAttribute('data-title', title);
        }
      });

      attachReserveHandlers(lang);
      localStorage.setItem('lang', lang);
      console.log('[i18n] Applied translations for', lang);
    } catch (err) {
      console.error('[i18n] Error applying translations', err);
    }
  }

  function attachReserveHandlers(lang) {
    const msgTemplate = t(lang, 'whatsapp_reserve_msg') || TRANSLATIONS['es']['whatsapp_reserve_msg'] || 'Hola, quiero reservar la obra \"{title}\".';
    document.querySelectorAll('[data-reserve]').forEach(function (btn) {
      btn.removeEventListener('click', reserveHandler);
      btn.addEventListener('click', reserveHandler);
    });

    function reserveHandler(ev) {
      ev.preventDefault();
      const btn = ev.currentTarget;
      const title = (btn.getAttribute('data-title') || '').trim();
      let msg = msgTemplate.replace('{title}', title || '');
      msg = msg.replace(/\s+/g, ' ').trim();
      const encoded = encodeURIComponent(msg);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
      window.open(url, '_blank');
    }

    document.querySelectorAll('[data-share]').forEach(function (el) {
      el.removeEventListener('click', shareHandler);
      el.addEventListener('click', shareHandler);
    });

    function shareHandler(ev) {
      ev.preventDefault();
      const langMsg = t(lang, 'hero_subtitle') || '';
      const shareData = {
        title: document.title,
        text: langMsg,
        url: location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        window.prompt('Copy this link to share', location.href);
      }
    }
  }

  function initLangSwitcher(defaultLang) {
    const stored = localStorage.getItem('lang');
    const initial = stored || defaultLang || 'es';
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const chosen = btn.getAttribute('data-lang');
        setActiveLangButton(chosen);
        applyTranslations(chosen);
      });
    });
    setActiveLangButton(initial);
    applyTranslations(initial);
  }

  function setActiveLangButton(lang) {
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  function loadTranslations() {
    const url = 'data/textos.json?t=' + Date.now();
    fetch(url, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        translations = data;
        console.log('[i18n] Loaded data/textos.json (ok)');
        initLangSwitcher(detectBrowserLang());
      })
      .catch(function (err) {
        console.warn('[i18n] Using fallback translations (could not load data/textos.json):', err);
        translations = TRANSLATIONS;
        initLangSwitcher(detectBrowserLang());
      });
  }

  function detectBrowserLang() {
    const stored = localStorage.getItem('lang');
    if (stored) return stored;
    const nav = navigator.language || navigator.userLanguage || 'es';
    const lang = nav.toLowerCase().indexOf('fr') === 0 ? 'fr' : (nav.toLowerCase().indexOf('en') === 0 ? 'en' : 'es');
    return lang;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTranslations);
  } else {
    loadTranslations();
  }

})();
