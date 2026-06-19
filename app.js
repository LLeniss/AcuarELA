/* app.js
   Render del catálogo y handlers:
   - carga data/config.json (data/config.json o config.json)
   - renderiza tarjetas según idioma actual (localStorage.lang)
   - botones: "Ver obra" => /obra.html?id=..., "Reservar" => abre WhatsApp con mensaje
   - re-renderiza al recibir 'langchange'
*/

(function () {
  'use strict';

  const CONFIG_PATHS = ['data/config.json', 'config.json'];
  const WA_NUMBER = '573155427152'; // número para WhatsApp (sin + ni 00)
  const CONTACT_EMAIL = 'vinapc2611@gmail.com';

  function log(...args) { console.info('[app]', ...args); }
  function warn(...args) { console.warn('[app]', ...args); }

  async function fetchJsonAny(paths) {
    for (const p of paths) {
      const url = `${p}?t=${Date.now()}`; // cache-bust temporal
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          log('No OK', url, res.status);
          continue;
        }
        const json = await res.json();
        log('Loaded', url);
        return json;
      } catch (err) {
        warn('fetch error', url, err && err.message ? err.message : err);
      }
    }
    throw new Error('No config JSON found');
  }

  function currentLang() {
    return localStorage.getItem('lang') ||
           document.documentElement.getAttribute('lang') ||
           (navigator.language || 'es').split('-')[0] ||
           'es';
  }

  // pick: si el campo es objeto con claves por idioma devuelve la correcta
  function pickField(field, lang) {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
      return field[lang] || field.es || Object.values(field)[0] || '';
    }
    return String(field);
  }

  // Renderiza el grid del catálogo
  function renderCatalog(catalog, containerId = 'catalogo-grid') {
    const container = document.getElementById(containerId);
    if (!container) {
      warn('#' + containerId + ' no encontrado en DOM');
      return;
    }

    const lang = currentLang();
    const obras = (catalog && catalog.obras) || [];

    const html = obras.map((o, i) => {
      const titulo = pickField(o.titulo, lang) || '—';
      const descripcion = pickField(o.descripcion, lang) || '';
      const estado = pickField(o.estado, lang) || '';
      const tecnica = o.tecnica || '';
      const dimensiones = o.dimensiones || '';
      const anio = o.anio || '';
      const precio = o.precio ? `<div class="cat-card__price">${o.precio}</div>` : '';
      const img = o.imagen || '';

      const alt = `${titulo} — ${tecnica} ${dimensiones}`.trim();

      return `
<article class="cat-card" data-id="${o.id || i}">
  <a class="cat-card__media" href="#" data-open="${i}" aria-label="${titulo}">
    <img class="cat-card__img" src="${img}" alt="${alt}">
  </a>
  <div class="cat-card__body">
    <div class="cat-card__head">
      <h3 class="cat-card__title">${titulo}</h3>
      <span class="cat-card__badge">${estado}</span>
    </div>
    <p class="cat-card__desc">${descripcion}</p>
    <div class="cat-card__meta">${tecnica}${dimensiones ? ' · ' + dimensiones : ''}${anio ? ' · ' + anio : ''}</div>
    ${precio}
    <div class="cat-card__actions">
      <a class="btn btn--ghost view-btn" href="/obra.html?id=${encodeURIComponent(o.id || i)}" aria-label="Ver ${titulo}">Ver obra</a>
      <button class="btn btn--primary reserve-btn" data-reserve data-title="${titulo}">Reservar</button>
    </div>
  </div>
</article>
      `;
    }).join('\n');

    container.innerHTML = html;

    // Después de inyectar, enganchar listeners
    attachCardHandlers(container, catalog);
  }

  function attachCardHandlers(container, catalog) {
    // Reserve buttons: abren WhatsApp con mensaje localizado
    container.querySelectorAll('[data-reserve]').forEach(btn => {
      // evitar duplicar listeners
      btn.removeEventListener('click', onReserveClick);
      btn.addEventListener('click', onReserveClick);
    });

    // data-open -> abrir lightbox (si existe)
    container.querySelectorAll('[data-open]').forEach(el => {
      el.removeEventListener('click', onOpenClick);
      el.addEventListener('click', onOpenClick);
    });
  }

  function onReserveClick(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const title = btn.dataset.title || (btn.closest && btn.closest('.cat-card') && btn.closest('.cat-card').querySelector('.cat-card__title')?.textContent) || '';
    const lang = currentLang();

    const templates = {
      es: `Hola, quiero reservar la obra "${title}". ¿Me indican el proceso? Mi correo: ${CONTACT_EMAIL}`,
      en: `Hello, I would like to reserve the artwork "${title}". Please let me know the process. My email: ${CONTACT_EMAIL}`,
      fr: `Bonjour, je souhaite réserver l'œuvre "${title}". Merci de m'indiquer la marche à suivre. Mon email : ${CONTACT_EMAIL}`
    };

    const message = templates[lang] || templates.es;
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener');
  }

  function onOpenClick(e) {
    e.preventDefault();
    const el = e.currentTarget;
    const idx = el.getAttribute('data-open');
    openLightboxByIndex(Number(idx));
  }

  // LIGHTBOX simple: busca dialog#cat-lightbox
  function openLightboxByIndex(idx) {
    if (!window.CATALOG || !Array.isArray(window.CATALOG.obras)) return;
    const obra = window.CATALOG.obras[idx];
    if (!obra) return;
    const lang = currentLang();
    const titulo = pickField(obra.titulo, lang);
    const desc = pickField(obra.descripcion, lang);
    const img = obra.imagen || '';

    const dlg = document.getElementById('cat-lightbox');
    if (!dlg) {
      // Si no existe dialog, fallback a abrir la ficha
      window.location.href = `/obra.html?id=${encodeURIComponent(obra.id || idx)}`;
      return;
    }

    // Rellenar contenido
    const imgEl = dlg.querySelector('.lb__img');
    const titleEl = dlg.querySelector('.lb__title');
    const descEl = dlg.querySelector('.lb__desc');
    const reserveBtn = dlg.querySelector('.lb__reserve');

    if (imgEl) imgEl.src = img;
    if (titleEl) titleEl.textContent = titulo;
    if (descEl) descEl.textContent = desc;

    if (reserveBtn) {
      reserveBtn.onclick = () => {
        const templates = {
          es: `Hola, quiero reservar la obra "${titulo}". Mi correo: ${CONTACT_EMAIL}`,
          en: `Hello, I would like to reserve the artwork "${titulo}". My email: ${CONTACT_EMAIL}`,
          fr: `Bonjour, je souhaite réserver l'œuvre "${titulo}". Mon email : ${CONTACT_EMAIL}`
        };
        const message = templates[lang] || templates.es;
        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank', 'noopener');
      };
    }

    // Mostrar dialog
    try {
      dlg.showModal();
    } catch (e) {
      // fallback para navegadores que no soportan <dialog>
      dlg.style.display = 'block';
    }
  }

  function closeLightbox() {
    const dlg = document.getElementById('cat-lightbox');
    if (!dlg) return;
    try {
      dlg.close();
    } catch (e) {
      dlg.style.display = 'none';
    }
  }

  // Inicialización
  async function init() {
    // Listener para cerrar lightbox
    document.addEventListener('click', (e) => {
      if (e.target.matches('#cat-lightbox .lb__close') || e.target.id === 'cat-lightbox') {
        closeLightbox();
      }
    });

    // Cargar config
    let config = null;
    try {
      config = await fetchJsonAny(CONFIG_PATHS);
      window.CATALOG = config; // disponible globalmente si hace falta
    } catch (e) {
      warn('No se pudo cargar config.json:', e);
      config = { obras: [] };
      window.CATALOG = config;
    }

    // Render inicial
    renderCatalog(config, 'catalogo-grid');

    // Re-render al cambiar idioma
    window.addEventListener('langchange', () => {
      log('langchange recibido -> re-render catalogo');
      renderCatalog(window.CATALOG, 'catalogo-grid');
    });

    log('app inicializada');
  }

  // Ejecutar al DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
