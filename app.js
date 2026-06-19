// app.js
// Módulo responsable de renderizar catálogo y manejar botones (Reservar / Ver obra).
// Ajustes: lee idioma desde localStorage (fallback), escucha 'langchange' y re-renderiza,
// asegura que cada tarjeta tiene data-title y data-reserve, y usa delegación de eventos
// para que los botones funcionen aunque las tarjetas se vuelvan a pintar.

(function () {
  'use strict';

  // Helpers
  function safeLog(...args) { if (window.console && window.console.log) console.log.apply(console, args); }
  function safeWarn(...args) { if (window.console && window.console.warn) console.warn.apply(console, args); }

  // Obtiene idioma actual de forma robusta
  function currentLang() {
    return localStorage.getItem('lang') ||
      document.documentElement.getAttribute('lang') ||
      (navigator.language || navigator.userLanguage || 'es').split('-')[0] ||
      'es';
  }

  // Pick helper: si es objeto por idiomas -> devuelve idioma, si es string -> devuelve directo
  function pick(field, lang) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') return field[lang] || field.es || Object.values(field)[0] || '';
    return '';
  }

  // Load config: intenta usar window.CONFIG si ya fue inyectado; si no, intenta fetch a data/config.json
  async function loadConfig() {
    if (window.CONFIG) return window.CONFIG;
    try {
      const resp = await fetch('data/config.json?t=' + Date.now(), { cache: 'no-store' });
      if (resp.ok) {
        const cfg = await resp.json();
        window.CONFIG = cfg;
        return cfg;
      } else {
        safeWarn('[app] config.json not found (status ' + resp.status + ')');
      }
    } catch (e) {
      safeWarn('[app] loadConfig error', e);
    }
    // fallback mínimo
    window.CONFIG = window.CONFIG || {};
    return window.CONFIG;
  }

  // Render del catálogo
  function renderCatalog(cfg) {
    const grid = document.querySelector('#catalogo-grid');
    if (!grid) {
      safeWarn('[app] #catalogo-grid no existe en DOM');
      return;
    }
    const lang = currentLang();
    const obras = (cfg && cfg.catalogo && cfg.catalogo.obras) || (cfg.obras) || [];

    // Si no hay obras, mostrar mensaje
    if (!obras.length) {
      grid.innerHTML = `<p class="catalog-empty">No hay obras para mostrar.</p>`;
      return;
    }

    grid.innerHTML = obras.map((o, i) => {
      const titulo = pick(o.titulo, lang) || `Obra ${o.id || i + 1}`;
      const descripcion = pick(o.descripcion, lang) || '';
      const estado = pick(o.estado, lang) || '';
      const tecnica = o.tecnica || '';
      const dims = o.dimensiones || '';
      const anio = o.anio || '';
      const precio = o.precio || '';
      const imagen = o.imagen || (o.image || '');

      // Botones: "Ver obra" lleva a /obra.html?id=... (puedes ajustar la ruta si usas otra)
      // "Reservar" es un botón que llevará data-title para el handler global.
      return `
        <article class="catalog-item" data-id="${o.id || i}">
          <a class="catalog-media" href="/obra.html?id=${encodeURIComponent(o.id || i)}" data-open="${i}" aria-label="${titulo}">
            <img class="catalog-thumb" src="${imagen}" alt="${titulo}">
          </a>
          <div class="catalog-body">
            <div class="catalog-head">
              <h3 class="catalog-title">${titulo}</h3>
              ${estado ? `<span class="catalog-badge">${estado}</span>` : ''}
            </div>
            <p class="catalog-desc">${descripcion}</p>
            <div class="catalog-meta">${tecnica}${dims ? ' · ' + dims : ''}${anio ? ' · ' + anio : ''}</div>
            ${precio ? `<div class="catalog-price">${precio}</div>` : ''}
            <div class="catalog-actions">
              <a class="btn btn-outline view-btn" href="/obra.html?id=${encodeURIComponent(o.id || i)}" aria-label="${titulo}">Ver obra</a>
              <button class="btn btn-primary reserve-btn" data-reserve data-title="${titulo}">Reservar</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Handler global para botones (delegación)
  function setupDelegation(cfg) {
    document.addEventListener('click', function (ev) {
      const btn = ev.target.closest('.reserve-btn, .view-btn, [data-open]');
      if (!btn) return;

      // Reservar (abre WhatsApp)
      if (btn.classList.contains('reserve-btn')) {
        ev.preventDefault();
        const title = btn.getAttribute('data-title') || btn.dataset.title || '';
        // intentar leer contacto desde cfg
        const whatsapp = (cfg && cfg.contact && cfg.contact.whatsapp) || (cfg.whatsapp) || '';
        const email = (cfg && cfg.contact && cfg.contact.email) || (cfg.email) || '';
        const waNumber = whatsapp ? whatsapp.replace(/\D/g, '') : (cfg && cfg.contact && cfg.contact.phone) || '';
        const wa = waNumber ? waNumber.replace(/\D/g, '') : '';

        const lang = currentLang();
        // Mensajes por idioma básicos; si tienes plantillas en textos.json, podríamos leerlas desde window.i18n.texts
        const templates = {
          es: `Hola, quiero reservar la obra "${title}". Mi correo: ${email}`,
          en: `Hello, I would like to reserve the artwork "${title}". My email: ${email}`,
          fr: `Bonjour, je souhaite réserver l'œuvre "${title}". Mon email : ${email}`
        };
        const message = (templates[lang] || templates.es);
        if (wa) {
          const url = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
          window.open(url, '_blank', 'noopener');
        } else {
          // fallback: si no hay WhatsApp, intentar mailto
          if (email) {
            window.location.href = `mailto:${email}?subject=${encodeURIComponent('Reserva: ' + title)}&body=${encodeURIComponent(message)}`;
          } else {
            alert('No hay contacto configurado para reservas.');
          }
        }
        return;
      }

      // View (a la ficha)
      if (btn.classList.contains('view-btn')) {
        // default behaviour is a link; allow navigation.
        return;
      }

      // [data-open] (abrir lightbox si implementado)
      const opener = ev.target.closest('[data-open]');
      if (opener) {
        // si tienes un lightbox/diálogo implementado, abrirlo aquí.
        // De momento dejamos que el enlace navegue a /obra.html?id=...
        // Si quieres que abra un dialog la implementación puede añadirse.
        return;
      }
    });
  }

  // Inicializador
  async function init() {
    try {
      const cfg = await loadConfig();
      renderCatalog(cfg);
      setupDelegation(cfg);

      // Re-render cuando cambie el idioma (i18n.js dispatchEvent('langchange'))
      window.addEventListener('langchange', function () {
        safeLog('[app] langchange event received - re-rendering catalog');
        renderCatalog(window.CONFIG || cfg);
      });

      // También re-render si window.CONFIG cambia (poco probable)
      safeLog('[app] initialized catalog');
    } catch (e) {
      safeWarn('[app] init error', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
