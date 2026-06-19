/* =================================================================
   app.js  ·  TEMA EDITABLE + CATÁLOGO DINÁMICO (desde data/config.json)
   -----------------------------------------------------------------
   QUÉ HACE ESTE ARCHIVO:
   1) Lee data/config.json
   2) Aplica la paleta de colores y las fuentes que definiste ahí
   3) Dibuja el catálogo de obras (N obras) leyendo el JSON
   4) Abre cada obra ampliada en una ventana (lightbox) con su ficha
   5) Genera datos estructurados (Schema.org) de cada obra para SEO/IA
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
    return document.documentElement.getAttribute("lang") || "es";
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

    // --- Delegación de click en el grid para abrir lightbox (attach una sola vez) ---
    if (!grid.dataset.listenerAttached) {
      grid.addEventListener("click", function (ev) {
        const btn = ev.target.closest("[data-open]");
        if (!btn || !grid.contains(btn)) return;
        const idx = parseInt(btn.getAttribute("data-open"), 10);
        if (Number.isNaN(idx)) {
          console.warn("[catalogo] data-open no es un número:", btn.getAttribute("data-open"));
          return;
        }
        openLightbox(idx);
      });
      grid.dataset.listenerAttached = "1";
    }
  }

  /* ---------- 3) LIGHTBOX (ventana de obra ampliada) ---------- */
  function openLightbox(index) {
    const dlg = document.getElementById("cat-lightbox");
    if (!dlg || !CONFIG) {
      console.warn("[lightbox] Elemento #cat-lightbox no existe o CONFIG no cargada.");
      return;
    }
    const o = CONFIG.catalogo.obras[index];
    if (!o) {
      console.warn("[lightbox] Índice de obra inválido:", index);
      return;
    }

    // Elementos del lightbox (se asume que existen o se ignoran silenciosamente)
    const imgEl = dlg.querySelector(".lb__img");
    const panel = dlg.querySelector(".lb__panel");
    const meta = dlg.querySelector(".lb__meta");
    const closeBtn = dlg.querySelector(".lb__close");

    // Configurar sólo la imagen: esconder meta/textos para enfatizar obra
    if (meta) {
      meta.style.display = "none"; // ocultar ficha y textos
    }
    if (panel) {
      // panel compacto para centrar imagen
      panel.style.maxWidth = "95vw";
      panel.style.padding = "8px";
      panel.style.background = "transparent";
      panel.style.boxShadow = "none";
      panel.style.justifyContent = "center";
      panel.style.alignItems = "center";
    }
    if (closeBtn) {
      // darle espacio desde los bordes para que no quede pegado
      closeBtn.style.right = "18px";
      closeBtn.style.top = "12px";
      closeBtn.style.zIndex = "10001";
      closeBtn.style.background = "rgba(255,255,255,0.85)";
      closeBtn.style.borderRadius = "50%";
      closeBtn.style.width = "40px";
      closeBtn.style.height = "40px";
      closeBtn.style.display = "flex";
      closeBtn.style.alignItems = "center";
      closeBtn.style.justifyContent = "center";
      closeBtn.style.fontSize = "1.1rem";
      closeBtn.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
    }

    if (imgEl) {
      imgEl.src = o.imagen;
      imgEl.alt = (typeof o.titulo === "string" ? o.titulo : pick(o.titulo, currentLang()));
      // estilos inline para centrar / escalar correctamente
      imgEl.style.maxWidth = "95vw";
      imgEl.style.maxHeight = "90vh";
      imgEl.style.width = "auto";
      imgEl.style.height = "auto";
      imgEl.style.display = "block";
      imgEl.style.objectFit = "contain";
      imgEl.style.margin = "0 auto";
      imgEl.style.borderRadius = "6px";
      imgEl.style.boxShadow = "0 12px 30px rgba(0,0,0,0.25)";
      imgEl.loading = "eager"; // preferimos mostrar la imagen directamente
    }

    // Abrir diálogo con fallback. Nos aseguramos de que siempre quede visible y usable.
    try {
      if (typeof dlg.showModal === "function") {
        // Si ya está abierto, cerramos y reabrimos para forzar estado limpio (evita escenarios raros)
        if (dlg.open) {
          try { dlg.close(); } catch (e) { /* ignore */ }
        }
        dlg.showModal();
        dlg.setAttribute("aria-hidden", "false");
      } else {
        dlg.removeAttribute("hidden");
        dlg.setAttribute("open", "");
        dlg.style.display = "flex";
        dlg.setAttribute("aria-hidden", "false");
      }
      console.debug("[lightbox] Abriendo obra (solo imagen):", imgEl?.alt || index);
    } catch (err) {
      // Fallback si showModal falla
      dlg.setAttribute("open", "");
      dlg.style.display = "flex";
      dlg.setAttribute("aria-hidden", "false");
      console.warn("[lightbox] Fallback open:", err);
    }
  }

  function setupLightboxClose() {
    const dlg = document.getElementById("cat-lightbox");
    if (!dlg) {
      console.warn("[lightbox] No existe #cat-lightbox para setupClose.");
      return;
    }

    // Close handler (se declara fuera para poder reutilizarlo)
    function closeLightbox() {
      try {
        if (typeof dlg.close === "function") dlg.close();
        else dlg.removeAttribute("open");
      } catch (err) {
        dlg.removeAttribute("open");
      }
      dlg.style.display = "none";
      dlg.setAttribute("aria-hidden", "true");

      // limpiar imagen src para liberar memoria / evitar problemas de caching
      const imgEl = dlg.querySelector(".lb__img");
      if (imgEl) {
        // pequeña demora para evitar flicker si se abre inmediatamente otra vez
        setTimeout(() => {
          imgEl.src = "";
        }, 100);
      }
    }

    const closeBtn = dlg.querySelector(".lb__close");
    if (closeBtn) {
      // remover listeners previos para evitar duplicados si setup se llama varias veces
      closeBtn.removeEventListener("click", closeLightbox);
      closeBtn.addEventListener("click", closeLightbox);
    }

    // Cerrar al hacer clic fuera del panel (backdrop)
    dlg.removeEventListener("click", backdropClickHandler);
    dlg.addEventListener("click", backdropClickHandler);

    function backdropClickHandler(e) {
      if (e.target === dlg) closeLightbox();
    }

    // Escape key (global)
    document.removeEventListener("keydown", escHandler);
    document.addEventListener("keydown", escHandler);

    function escHandler(e) {
      if (e.key === "Escape") {
        if (dlg.hasAttribute("open") || dlg.getAttribute("aria-hidden") === "false") closeLightbox();
      }
    }

    // Exponer closeLightbox globalmente por si se necesita llamar externamente
    window.closeLightbox = closeLightbox;
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
          "Si abriste el archivo con doble clic (file://), usa un servidor local: " +
          "python3 -m http.server  → http://localhost:8000", err);
      });

    // Redibujar el catálogo cuando cambie el idioma (evento de i18n.js)
    window.addEventListener("langchange", function () {
      if (CONFIG) renderCatalog();
    });
  });
})();

// Attach WhatsApp reserve handler to catalogue reserve buttons (fallback)
document.addEventListener('DOMContentLoaded', function () {
  const WHATSAPP_NUMBER = '573155427152';
  const email = 'vinapc2611@gmail.com';
  document.querySelectorAll('.catalog-reserve, .reserve-btn, [data-catalog-reserve]').forEach(btn => {
    if (btn.dataset.reserveAttached === '1') return;
    btn.dataset.reserveAttached = '1';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const title = btn.dataset.title || btn.getAttribute('data-title') || document.querySelector('[data-i18n="obra_nombre"]')?.textContent || '';
      const msg = `Hola, quiero reservar la obra "${title}". Mi correo: ${email}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  });
});
