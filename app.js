// app.js
// Construye el catálogo (desde config.json), lightbox y manejo de reservas/WhatsApp.
// Requiere: config.json en la raíz y data/textos.json en data/

(() => {
  const DEFAULT_LANG = 'es';

  function q(sel){ return document.querySelector(sel); }
  function qa(sel){ return Array.from(document.querySelectorAll(sel)); }

  async function loadConfig(){
    try {
      const r = await fetch('config.json', {cache: 'no-store'});
      return await r.json();
    } catch(e){
      console.error('No se pudo cargar config.json', e);
      return null;
    }
  }

  function createCatalogCard(obra, lang, cfg){
    const title = (obra.titulo && (obra.titulo[lang] || obra.titulo.es)) || 'Obra';
    const meta = obra.tecnica || '';
    const price = obra.precio || '';
    const status = (obra.estado && (obra.estado[lang] || obra.estado.es)) || '';

    const card = document.createElement('article');
    card.className = 'cat-card';

    card.innerHTML = `
      <button class="cat-card__media" aria-label="${title}" data-id="${obra.id}">
        <img class="cat-card__img" src="${obra.imagen}" alt="${title}" loading="lazy" />
        <span class="cat-card__zoom">Ver obra</span>
      </button>
      <div class="cat-card__body">
        <div class="cat-card__head">
          <h3 class="cat-card__title">${title}</h3>
          <div class="cat-card__badge">${status}</div>
        </div>
        <div class="cat-card__meta">${meta}</div>
        <div class="cat-card__price">${price}</div>
        <div class="cat-card__actions">
          <button class="btn btn--ghost-dark btn--sm view-btn" data-id="${obra.id}">Ver obra</button>
          <a class="btn btn--primary btn--sm collect-btn" data-id="${obra.id}" href="#" target="_blank" rel="noopener">Coleccionar</a>
        </div>
      </div>
    `.trim();

    // click en la imagen o ver-btn abre lightbox
    card.querySelector('.cat-card__media').addEventListener('click', ()=> openLightbox(obra, cfg));
    card.querySelector('.view-btn').addEventListener('click', ()=> openLightbox(obra, cfg));

    // coleccionar -> whatsapp (se completará en open)
    return card;
  }

  function openLightbox(obra, cfg){
    const lang = document.documentElement.getAttribute('lang') || DEFAULT_LANG;
    const title = obra.titulo[lang] || obra.titulo.es;
    const desc = obra.descripcion ? (obra.descripcion[lang] || obra.descripcion.es) : '';
    const tecnica = obra.tecnica || '';
    const dimensiones = obra.dimensiones || '';
    const anio = obra.anio || '';
    const precio = obra.precio || '';

    const lb = q('#lightbox');
    q('#lb-img').src = obra.imagen;
    q('#lb-img').alt = title;
    q('#lb-title').textContent = title;
    q('#lb-desc').innerHTML = desc;
    const ficha = q('#lb-ficha');
    ficha.innerHTML = `
      <div><dt>Técnica</dt><dd>${tecnica}</dd></div>
      <div><dt>Dimensiones</dt><dd>${dimensiones}</dd></div>
      <div><dt>Año</dt><dd>${anio}</dd></div>
      <div><dt>Precio</dt><dd>${precio}</dd></div>
    `;

    // construir link de whatsapp para "Coleccionar"
    const contact = (cfg && cfg.contact) || {};
    const waRaw = (contact.whatsapp || '').replace(/\D/g,''); // solo dígitos
    const phone = waRaw.startsWith('57') ? waRaw : (waRaw ? ('57'+waRaw) : waRaw); // prefijo CO si el número no lo tiene
    const pageUrl = window.location.href;
    const text = encodeURIComponent(`${title} · Estoy interesado en coleccionar esta obra. ${pageUrl}`);
    const waLink = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;

    const collectBtn = q('#lb-collect');
    collectBtn.href = waLink;

    // show dialog
    try {
      lb.showModal();
      lb.setAttribute('aria-hidden', 'false');
    } catch(e){
      // fallback si dialog no soportado
      window.open(obra.imagen, '_blank');
    }
  }

  function closeLightbox(){
    const lb = q('#lightbox');
    try {
      lb.close();
      lb.setAttribute('aria-hidden', 'true');
    } catch(e){
      // ignore
    }
  }

  // inicializa catálogo
  async function initCatalog(){
    const cfg = await loadConfig();
    if (!cfg) return;
    const grid = q('#catalogo-grid');
    grid.innerHTML = '';

    // asegurar que exista config.catalogo.obras
    const obras = (cfg.catalogo && cfg.catalogo.obras) || [];
    const lang = document.documentElement.getAttribute('lang') || DEFAULT_LANG;

    obras.forEach(obra => {
      // Para obras marcadas "En progreso" (o similar), override badge text si existe traducción
      if (obra.estado && typeof obra.estado === 'string') {
        // nada
      }
      const card = createCatalogCard(obra, lang, cfg);
      grid.appendChild(card);
    });

    // asignar enlaces "Coleccionar" en cada tarjeta ahora que tenemos cfg
    qa('.collect-btn').forEach(btn => {
      const id = btn.getAttribute('data-id');
      const obra = obras.find(o => o.id === id);
      if (!obra) return;
      const title = (obra.titulo && (obra.titulo[document.documentElement.getAttribute('lang')] || obra.titulo.es)) || obra.id;
      const pageUrl = window.location.href;
      const phoneRaw = (cfg.contact && cfg.contact.whatsapp) ? (cfg.contact.whatsapp.replace(/\D/g,'')) : '';
      const phone = phoneRaw.startsWith('57') ? phoneRaw : (phoneRaw? '57'+phoneRaw : '');
      const text = encodeURIComponent(`${title} · Estoy interesado en coleccionar esta obra. ${pageUrl}`);
      const waLink = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
      btn.href = waLink;
    });

    // reserva rápida para obra principal
    const reservaMain = q('#reserve-obra-main');
    if (reservaMain) {
      reservaMain.addEventListener('click', () => {
        const phoneRaw = (cfg.contact && cfg.contact.whatsapp) ? (cfg.contact.whatsapp.replace(/\D/g,'')) : '';
        const phone = phoneRaw.startsWith('57') ? phoneRaw : (phoneRaw? '57'+phoneRaw : '');
        const text = encodeURIComponent(`Hola, quiero reservar la obra principal: ${document.querySelector('[data-i18n=\"obra_nombre\"]').textContent}.`);
        const waLink = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
        window.open(waLink, '_blank');
      });
    }

    // reserve compact
    const reserveCompact = q('#reserve-obra-compact');
    if (reserveCompact) {
      reserveCompact.addEventListener('click', () => {
        const phoneRaw = (cfg.contact && cfg.contact.whatsapp) ? (cfg.contact.whatsapp.replace(/\D/g,'')) : '';
        const phone = phoneRaw.startsWith('57') ? phoneRaw : (phoneRaw? '57'+phoneRaw : '');
        const text = encodeURIComponent(`Hola, quiero reservar información sobre la obra.`);
        const waLink = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
        window.open(waLink, '_blank');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await initCatalog();

    // Lightbox close
    const lbClose = q('#lb-close');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);

    // cerrar con ESC
    document.addEventListener('keydown', (e)=> {
      if (e.key === 'Escape') closeLightbox();
    });

    // re-render del catálogo cuando cambia el idioma (i18n.js dispara 'langchange')
    window.addEventListener('langchange', async () => {
      await initCatalog();
    });
  });
})();
