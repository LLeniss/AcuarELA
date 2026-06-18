(function () {
  'use strict';
  const FALLBACK = { "es": { "nav": {"home": "Inicio"}, "hero": {"title": "Cargando..."} } };
  
  function apply(data) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = key.split('.').reduce((o, i) => (o ? o[i] : null), data);
      if (val) el.textContent = val;
    });
    const title = key => key.split('.').reduce((o, i) => (o ? o[i] : null), data);
    if (title('meta.title')) document.title = title('meta.title');
  }

  async function init() {
    let lang = localStorage.getItem('lang') || navigator.language.split('-')[0] || 'es';
    if (!['es','en','fr','pt'].includes(lang)) lang = 'es';
    document.getElementById('lang-select').value = lang;

    try {
      // Forzamos descarga fresca con ?v=
      const r = await fetch(`/data/textos.json?v=${Date.now()}`, { cache: 'no-store' });
      const all = await r.json();
      const current = all[lang] || all['es'];
      apply(current);
      
      document.getElementById('lang-select').onchange = (e) => {
        localStorage.setItem('lang', e.target.value);
        location.reload();
      };
    } catch (e) {
      console.error("Error i18n:", e);
      apply(FALLBACK['es']);
    }
  }
  document.addEventListener('DOMContentLoaded', init);
})();
