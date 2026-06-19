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
    const root =
