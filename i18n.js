(function () {
  // --- 1. TRADUCCIONES DE RESPALDO (Fallback) ---
  // Si el JSON falla, la web usará esto. 
  // Edita aquí también si quieres máxima seguridad.
  const TRANSLATIONS = {
    "es": {
      "meta_title": "Eduvina Parada Cáceres · Artista de acuarela",
      "nav_historia": "Historia",
      "hero_title": "Ella es artista.<br>Y esto recién empieza.",
      "donar_nequi_num": "Número: 300 000 0000"
    },
    "en": {
      "meta_title": "Eduvina Parada Cáceres · Watercolor artist",
      "nav_historia": "Story",
      "hero_title": "She is an artist.<br>And this is just beginning.",
      "donar_nequi_num": "Number: 300 000 0000"
    }
  };

  // --- 2. MOTOR DE TRADUCCIÓN ---
  function applyLang(lang, texts) {
    const dict = texts[lang] || texts["es"];
    document.documentElement.lang = lang;

    // Traducir texto simple
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    // Traducir HTML (para etiquetas <br> o <strong>)
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const key = el.getAttribute("data-i18n-html");
      if (dict[key]) el.innerHTML = dict[key];
    });

    // Traducir atributos (como placeholders)
    document.querySelectorAll("[data-i18n-attr]").forEach(el => {
      const attrPair = el.getAttribute("data-i18n-attr").split(":");
      if (attrPair.length === 2 && dict[attrPair[1]]) {
        el.setAttribute(attrPair[0], dict[attrPair[1]]);
      }
    });

    // Actualizar Título de la pestaña
    if (dict["meta_title"]) document.title = dict["meta_title"];
  }

  // --- 3. CARGA Y MEZCLA (EL CORAZÓN DEL FIX) ---
  async function initI18n() {
    let finalTexts = TRANSLATIONS;

    try {
      // Forzamos al navegador a no usar caché con ?v= y no-store
      const response = await fetch("data/textos.json?v=" + Date.now(), {
        cache: "no-store"
      });

      if (response.ok) {
        const remoteTexts = await response.json();
        // Mezclamos lo del JSON sobre el respaldo
        finalTexts = Object.assign({}, TRANSLATIONS, remoteTexts);
        console.log("✅ [i18n] JSON cargado y actualizado correctamente.");
      } else {
        console.warn("⚠️ [i18n] El archivo data/textos.json respondió con error " + response.status);
      }
    } catch (e) {
      console.error("❌ [i18n] Error crítico cargando JSON, usando respaldo embebido.", e);
    }

    // Detectar idioma (localStorage > navegador > español)
    let selectedLang = localStorage.getItem("lang");
    if (!selectedLang) {
      selectedLang = navigator.language.startsWith("en") ? "en" : "es";
    }

    applyLang(selectedLang, finalTexts);

    // Guardar los textos globalmente por si cambias el idioma con un botón
    window.allTexts = finalTexts;
  }

  // Función global para los botones de la web
  window.setLanguage = function (lang) {
    localStorage.setItem("lang", lang);
    if (window.allTexts) {
      applyLang(lang, window.allTexts);
    } else {
      location.reload(); // Recarga si algo falló
    }
  };

  // --- 4. ARRANQUE ---
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }
})();
