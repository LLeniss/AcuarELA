/* =================================================================
   app.js  ·  TEMA EDITABLE + CATÁLOGO DINÁMICO (desde data/config.json)
   -----------------------------------------------------------------
   Adaptado para usar el modal existente #obra-modal (ids: modal-img,
   modal-title, modal-desc, modal-ficha, modal-collect) en lugar de
   buscar #cat-lightbox.
   ================================================================= */

(function () {
  "use strict";

  // Etiquetas de la ficha del catálogo en cada idioma
  const LABELS = {
    es: { tecnica: "Técnica", medidas: "Medidas", anio: "Año", precio: "Precio", ver: "Ver obra", reservar: "Reservar", cerrar: "Cerrar" },
    en: { tecnica: "Technique", medidas: "Dimensions", anio: "Year", precio: "Price", ver: "View artwork", reservar: "Reserve", cerrar: "Close" },
    fr: { tecnica: "Technique", medidas: "Dimensions", anio: "Année", precio: "Prix", ver: "Voir l'œuvre", reservar: "Réserver", cerrar: "Fermer" }
  };

  let CONFIG = null;

  function currentLang() {
    // toma lang desde <html lang="..."> si existe, sino fallback a 'es'
    return document.documentElement.getAttribute("lang") || localStorage.getItem("lang") || "es";
  }

  // Devuelve el texto en el idioma actual, con respaldo en español
  function pick(obj, lang) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.es || Object.values(obj)[0] || "";
  }

  /* ---------- 1) APLICAR TEMA (colores + fuentes) ---------- */
  function applyTheme(tema) {
    if (!tema) return;
    const root = document.documentElement.style;
    const map = {
      "--color-primary": tema.colorPrimario,
      "--color-primary-dark": tema.colorPrimarioOscuro,
      "--color-accent": tema.colorAcento,
      "--color-accent-dark": tema.colorAcentoOscuro,
      "--color-bg": tema.colorFondo,
      "--color-alt": tema.colorAlterno,
      "--color-surface": tema.colorSuperficie,
      "--color-text": tema.colorTexto,
      "--color-muted": tema.colorTextoSuave,
      "--color-dark": tema.colorOscuro,
      "--font-serif": tema.fuenteTitulos,
      "--font-sans": tema.fuenteCuerpo
    };
    Object.keys(map).forEach((k) => { if (map[k]) root.setProperty(k, map[k]); });

    // Cargar Google Fonts personalizadas si se indicó una URL
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

  /* ---------- 2) DIBUJAR CATÁLOGO ---------- */
  function renderCatalog() {
    const grid = document.getElementById("catalogo-grid");
    if (!grid || !CONFIG || !CONFIG.catalogo) return;
    const lang = currentLang();
    const L = LABELS[lang] || LABELS.es;
    const obras = CONFIG.catalogo.obras || [];

    grid.innerHTML = obras.map((o, i) => {
      const titulo = pick(o.titulo, lang);
      const estado = pick(o.estado, lang);
      const alt = titulo + " — " + (o.tecnica || "acuarela") + " de Eduvina Parada Cáceres";
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

    // Activar apertura de lightbox (usa el modal existente #obra-modal)
    grid.querySelectorAll("[data-open]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        const idx = parseInt(el.getAttribute("data-open"), 10);
        if (Number.isFinite(idx)) openLightbox(idx);
      });
    });
  }

  /* ---------- 3) LIGHTBOX (ventana de obra ampliada) ----------
     Esta versión usa el modal existente con id="obra-modal" y nodos:
     #modal-img, #modal-title, #modal-desc, #modal-ficha, #modal-collect
  ----------------------------------------------------------------- */
  function openLightbox(index) {
    const modal = document.getElementById("obra-modal");
    if (!modal || !CONFIG || !CONFIG.catalogo) {
      console.warn("[catalogo] Modal o CONFIG no disponible", modal, CONFIG);
      return;
    }
    const obras = CONFIG.catalogo.obras || [];
    const o = obras[index];
    if (!o) {
      console.warn("[catalogo] Obra no encontrada index=", index);
      return;
    }
    const lang = currentLang();
    const L = LABELS[lang] || LABELS.es;

    // Elementos del modal (asegurarse que existan)
    const imgEl = document.getElementById("modal-img");
    const titleEl = document.getElementById("modal-title");
    const descEl = document.getElementById("modal-desc");
    const fichaEl = document.getElementById("modal-ficha");
    const collectEl = document.getElementById("modal-collect");

    if (imgEl) { imgEl.src = o.imagen; imgEl.alt = pick(o.titulo, lang) || ""; }
    if (titleEl) titleEl.textContent = pick(o.titulo, lang) || "";
    if (descEl) descEl.textContent = pick(o.descripcion, lang) || "";

    if (fichaEl) {
      // construir ficha con etiquetas localizadas
      const parts = [];
      if (o.tecnica) parts.push(`<div><dt>${L.tecnica}</dt><dd>${o.tecnica}</dd></div>`);
      if (o.dimensiones) parts.push(`<div><dt>${L.medidas}</dt><dd>${o.dimensiones}</dd></div>`);
      if (o.anio) parts.push(`<div><dt>${L.anio}</dt><dd>${o.anio}</dd></div>`);
      if (o.precio) parts.push(`<div><dt>${L.precio}</dt><dd>${o.precio}</dd></div>`);
      parts.push(`<div><dt>&nbsp;</dt><dd><span class="cat-card__badge">${pick(o.estado, lang)}</span></dd></div>`);
      fichaEl.innerHTML = parts.join("");
    }

    // actualizar link de reservar/coleccionar (modal-collect)
    if (collectEl) {
      const waBase = (CONFIG.contact && CONFIG.contact.whatsapp) ? CONFIG.contact.whatsapp : "https://wa.me/573155427152";
      // si waBase ya contiene ?text o no, lo manejamos concat correctamente
      const text = encodeURIComponent((lang === "en") ? `Hello, I'm interested in "${pick(o.titulo, lang)}".` : (lang === "fr") ? `Bonjour, je m'intéresse à "${pick(o.titulo, lang)}".` : `Hola, estoy interesado(a) en "${pick(o.titulo, lang)}".`);
      collectEl.href = waBase + (waBase.includes("?") ? "&" : "?") + "text=" + text;
      collectEl.setAttribute("target", "_blank");
      collectEl.setAttribute("rel", "noopener");
      collectEl.textContent = L.reservar;
    }

    // mostrar modal (usa atributo aria-hidden en tu HTML)
    modal.setAttribute("aria-hidden", "false");
    // poner foco en el cierre para accesibilidad
    const closeBtn = modal.querySelector("[data-close]");
    if (closeBtn) closeBtn.focus();
    // bloquear scroll si quieres (opcional)
    document.documentElement.classList.add("modal-open");
  }

  function closeLightbox() {
    const modal = document.getElementById("obra-modal");
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("modal-open");
  }

  function setupLightboxClose() {
    const modal = document.getElementById("obra-modal");
    if (!modal) return;

    // Botones con data-close (cerrar)
    modal.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeLightbox();
      });
    });

    // Click en backdrop (asumiendo .modal__backdrop)
    const backdrop = modal.querySelector(".modal__backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        closeLightbox();
      });
    }

    // Cerrar con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const open = modal.getAttribute("aria-hidden") === "false";
        if (open) closeLightbox();
      }
    });

    // Click fuera del panel (si el modal no usa backdrop) - fallback
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  /* ---------- 4) SCHEMA.ORG del catálogo (SEO + IA) ---------- */
  function injectCatalogSchema() {
    if (!CONFIG || !CONFIG.catalogo) return;
    const obras = CONFIG.catalogo.obras || [];
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Catálogo de obras de Eduvina Parada Cáceres",
      "itemListElement": obras.map((o, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "VisualArtwork",
          "name": pick(o.titulo, "es"),
          "description": pick(o.descripcion, "es"),
          "artform": "Acuarela",
          "artMedium": o.tecnica || "Acuarela",
          "dateCreated": o.anio || "",
          "creator": { "@type": "Person", "name": "Eduvina Parada Cáceres" },
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

  document.addEventListener("DOMContentLoaded", function () {
    setupLightboxClose();
    fetch("data/config.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(init)
      .catch((err) => {
        console.warn("[catálogo] No se pudo leer data/config.json. " +
          "Si abri
