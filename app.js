/* =================================================================
   app.js  ·  TEMA EDITABLE + CATÁLOGO DINÁMICO (desde data/config.json)
   -----------------------------------------------------------------
   - Lightbox minimalista: muestra solo la imagen (sin ficha).
   - Listener robusto para botones "Ver obra" (delegación a nivel documento).
   - Cierre seguro y reset del contenido al cerrar.
   ================================================================= */

(function () {
  "use strict";

  // Etiquetas de la ficha del catálogo en cada idioma (solo para textos mínimos)
  const LABELS = {
    es: { ver: "Ver obra", reservar: "Reservar", cerrar: "Cerrar" },
    en: { ver: "View artwork", reservar: "Reserve", cerrar: "Close" },
    fr: { ver: "Voir l'œuvre", reservar: "Réserver", cerrar: "Fermer" }
  };

  let CONFIG = null;

  function currentLang() {
    return document.documentElement.getAttribute("lang") || "es";
  }

  function pick(obj, lang) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.es || Object.values(obj)[0] || "";
  }

  /* ---------- APLICAR TEMA ---------- */
  function applyTheme(tema) {
    if (!tema) return;
    const root = document.documentElement.style;
    const map = {
      "--color-primary": tema.colorPrimario,
      "--color-accent": tema.colorAcento,
      "--color-bg": tema.colorFondo,
      "--color-surface": tema.colorSuperficie,
      "--color-text": tema.colorTexto,
      "--font-serif": tema.fuenteTitulos,
      "--font-sans": tema.fuenteCuerpo
    };
    Object.keys(map).forEach((k) => { if (map[k]) root.setProperty(k, map[k]); });

    if (tema.googleFontsUrl) {
      const exists = [...document.querySelectorAll("link[rel=stylesheet]")]
        .some((l) => l.href === tema.googleFontsUrl);
      if (!exists) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = tema.googleFontsUrl;
        document.head.appendChild(link);
      }
    }
  }

  /* ---------- RENDER CATALOGO ---------- */
  function renderCatalog() {
    const grid = document.getElementById("catalogo-grid");
    if (!grid || !CONFIG || !CONFIG.catalogo) return;
    const lang = currentLang();
    const L = LABELS[lang] || LABELS.es;
    const obras = CONFIG.catalogo.obras || [];

    grid.innerHTML = obras.map((o, i) => {
      const titulo = pick(o.titulo, lang);
      const estado = pick(o.estado, lang);
      const alt = titulo + " — " + (o.tecnica || "obra") + " de Eduvina Parada Cáceres";
      return `
      <article class="cat-card" data-index="${i}">
        <button class="cat-card__media" type="button" data-open="${i}" aria-label="${L.ver}: ${titulo}">
          <img src="${o.imagen}" alt="${alt}" loading="lazy" class="cat-card__img" />
          <span class="cat-card__zoom">${L.ver} ⤢</span>
        </button>
        <div class="cat-card__body">
          <div class="cat-card__head">
            <h3 class="cat-card__title">${titulo}</h3>
            <span class="cat-card__badge">${estado}</span>
          </div>
          <p class="cat-card__meta">${o.tecnica || ""}${o.dimensiones ? " · " + o.dimensiones : ""}${o.anio ? " · " + o.anio : ""}</p>
          ${o.precio ? `<p class="cat-card__price">${o.precio}</p>` : ""}
          <div class="cat-card__actions">
            <button class="btn btn--ghost-dark btn--sm" type="button" data-open="${i}">${L.ver}</button>
            <a class="btn btn--accent btn--sm" href="#contacto">${L.reservar}</a>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  /* ---------- LIGHTBOX minimalista (solo imagen) ---------- */
  function openLightbox(index) {
    const dlg = document.getElementById("cat-lightbox");
    if (!dlg || !CONFIG) {
      console.warn("[lightbox] #cat-lightbox no existe o CONFIG no cargada.");
      return;
    }
    const o = CONFIG.catalogo.obras[index];
    if (!o) {
      console.warn("[lightbox] Índice inválido:", index);
      return;
    }

    const imgEl = dlg.querySelector(".lb__img");
    const closeBtn = dlg.querySelector(".lb__close");

    if (imgEl) {
      // Poner atributo src con carga diferida para responsividad
      imgEl.src = o.imagen;
      imgEl.alt = pick(o.titulo, currentLang());
    }

    // Abrir dialog con fallback
    try {
      if (typeof dlg.showModal === "function") {
        dlg.showModal();
        dlg.setAttribute("aria-hidden", "false");
      } else {
        dlg.setAttribute("open", "");
        dlg.style.display = "flex";
        dlg.setAttribute("aria-hidden", "false");
      }
      // Forzar foco en el close button por accesibilidad
      if (closeBtn) closeBtn.focus();
      console.debug("[lightbox] Abierta obra:", pick(o.titulo, currentLang()));
    } catch (err) {
      // Fallback visual
      dlg.setAttribute("open", "");
      dlg.style.display = "flex";
      dlg.setAttribute("aria-hidden", "false");
      if (closeBtn) closeBtn.focus();
      console.warn("[lightbox] Fallback open:", err);
    }
  }

  /* ---------- CIERRE y RESET ---------- */
  function setupLightboxClose() {
    const dlg = document.getElementById("cat-lightbox");
    if (!dlg) {
      console.warn("[lightbox] No existe #cat-lightbox para setupClose.");
      return;
    }
    const closeBtn = dlg.querySelector(".lb__close");

    function closeLightbox() {
      try {
        if (typeof dlg.close === "function") dlg.close();
        else dlg.removeAttribute("open");
      } catch (err) {
        dlg.removeAttribute("open");
      }
      dlg.style.display = "none";
      dlg.setAttribute("aria-hidden", "true");

      // Reset imagen para evitar posibles bloqueo de recursos / reproducir problemas
      const imgEl = dlg.querySelector(".lb__img");
      if (imgEl) {
        // quitar src luego de un pequeño delay para que el cierre sea visualmente inmediato
        setTimeout(() => { imgEl.removeAttribute("src"); imgEl.alt = ""; }, 120);
      }

      // devolver foco al primer botón visible "Ver obra" (mejor experiencia)
      const firstBtn = document.querySelector('#catalogo-grid [data-open]');
      if (firstBtn) firstBtn.focus();
    }

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeLightbox(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });

    // Exponer para llamadas externas si hace falta
    window.closeLightbox = closeLightbox;
  }

  /* ---------- SCHEMA.ORG (opcional) ---------- */
  function injectCatalogSchema() {
    if (!CONFIG || !CONFIG.catalogo) return;
    const obras = CONFIG.catalogo.obras || [];
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Catálogo de obras",
      "itemListElement": obras.map((o, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "VisualArtwork",
          "name": pick(o.titulo, "es"),
          "description": pick(o.descripcion, "es"),
          "image": o.imagen
        }
      }))
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(itemList);
    document.head.appendChild(s);
  }

  /* ---------- ARRANQUE ---------- */
  function init(config) {
    CONFIG = config;
    applyTheme(config.tema);
    renderCatalog();
    injectCatalogSchema();
  }

  /* ---------- Handler global de clicks para "Ver obra" ----------
     (se registra solo una vez y no se pierde si re-renderizas el grid) */
  function attachGlobalOpenHandler() {
    document.addEventListener("click", function (ev) {
      const btn = ev.target.closest("[data-open]");
      if (!btn) return;
      const grid = document.getElementById("catalogo-grid");
      if (!grid || !grid.contains(btn)) re
