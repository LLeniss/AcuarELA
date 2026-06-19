(function () {
  'use strict';

  const WHATSAPP_NUMBER = '573155427152';

  const TRANSLATIONS_FALLBACK = {
    "es": {
      "meta_title": "Eduvina Parada Cáceres · Su primera obra",
      "site_name": "Eduvina Parada Cáceres",
      "hero_title": "Ella es artista. Y esto recién empieza.",
      "contact_email": "vinapc2611@gmail.com",
      "contact_whatsapp_text": "315 542 7152",
      "whatsapp_reserve_msg": "Hola, quiero reservar la obra \"{title}\"."
    }
  };

  let currentTranslations = TRANSLATIONS_FALLBACK;

  function t(lang, key) {
    return (currentTranslations[lang] && currentTranslations[lang][key]) || (TRANSLATIONS_FALLBACK['es'][key]) || '';
  }

  function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(lang, key);
      if (val) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = t(lang, key);
      if (val) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        const val = t(lang, key);
        if (val) el.setAttribute(attr, val);
      });
    });

    document.querySelectorAll('[data-reserve]').forEach(btn => {
      const key = btn.getAttribute('data-reserve-title-key');
      if (key) btn.setAttribute('data-title', t(lang, key));
      
      btn.onclick = (e) => {
        e.preventDefault();
        const title = btn.getAttribute('data-title') || '';
        const msgTpl = t(lang, 'whatsapp_reserve_msg');
        const msg = msgTpl.replace('{title}', title);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
      };
    });

    localStorage.setItem('lang', lang);
    updateActiveButton(lang);
  }

  function updateActiveButton(lang) {
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
    });
  }

  function init() {
    const lang = localStorage.getItem('lang') || 'es';
    fetch(`data/textos.json?v=${Date.now()}`)
      .then(r => r.json())
      .then(data => {
        currentTranslations = data;
        applyTranslations(lang);
      })
      .catch(() => applyTranslations(lang));

    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.onclick = () => applyTranslations(btn.getAttribute('data-lang'));
    });
  }

  window.addEventListener('DOMContentLoaded', init);
})();
