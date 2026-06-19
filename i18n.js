(function () {
  // --- 1. TRADUCCIONES DE RESPALDO (Fallback) ---
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

  // --- 2. UTIL: aplica valor en elemento (maneja HTML y saltos) ---
  function applyValue(el, value, isHtmlAllowed = false) {
    if (value === undefined) return;
    const hasHtml = /<\/?[a-z][\s\S]*>/i.test(value);
    const hasNewlines = /\n/.test(value);
    if (hasHtml || hasNewlines || isHtmlAllowed) {
      el.innerHTML = hasNewlines ? value.replace(/\n/g, "<​br>") : value;
    } else {
      el.textContent = value;
    }
  }

  // --- 3. MOTOR DE TRADUCCIÓN MEJORADO ---
  function applyLang(lang, texts) {
    const dict = (texts && texts[lang]) || (texts && texts["es"]) || {};
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      applyValue(el, dict[key], false);
    });

    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const key = el.getAttribute("data-i18n-html");
      applyValue(el, dict[key], true);
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(el => {
      const attrPair = el.getAttribute("data-i18n-attr").split(":");
      if (attrPair.length === 2) {
        const attr = attrPair[0].trim();
        const key = attrPair[1].trim();
        const val = dict[key];
        if (val !== undefined) el.setAttribute(attr, val);
      }
    });

    if (dict["meta_title"]) {
      document.title = dict["meta_title"];
    }
  }

  // --- 4. REAPLICACIÓN: observar cambios dinámicos en el DOM ---
  function initApplyReapply(lang, texts) {
    applyLang(lang, texts);

    window.addEventListener("load", () => {
      console.log("[i18n] Reaplicando traducciones tras window.load");
      applyLang(lang, texts);
    });

    const observer = new MutationObserver((mutations) => {
      let need = false;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          for (const n of m.addedNodes) {
            if (n.nodeType === 1) {
              if (n.hasAttribute && (n.hasAttribute("data-i18n") || n.hasAttribute("data-i18n-html") || n.hasAttribute("data-i18n-attr"))) {
                need = true; break;
              }
              if (n.querySelector && n.querySelector("[data-i18n], [data-i18n-html], [data-i18n-attr]")) {
                need = true; break;
              }
            }
          }
        }
        if (need) break;
      }
      if (need) {
        clearTimeout(window._i18n_reapply_timeout);
        window._i18n_reapply_timeout = setTimeout(() => {
          console.log("[i18n] Nodos nuevos detectados — reaplicando traducciones");
          applyLang(lang, texts);
        }, 120);
      }
    });

    const root = document.documentElement || document.body;
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
      window._i18n_observer = observer;
    }
  }

  // --- 5. CARGA Y MEZCLA (fetch + merge) ---
  async function initI18n() {
    let finalTexts = TRANSLATIONS;

    try {
      const response = await fetch("/data/textos.json?v=" + Date.now(), { cache: "no-store" });
      if (response.ok) {
        const remoteTexts = await response.json();
        // Merge superficial: remote override wins
        finalTexts = Object.assign({}, TRANSLATIONS, remoteTexts);
        console.log("✅ [i18n] JSON cargado y actualizado correctamente.");
      } else {
        console.warn("⚠️ [i18n] data/textos.json respondió con status " + response.status + " — usando respaldo embebido");
      }
    } catch (e) {
      console.error("❌ [i18n] Error cargando data/textos.json — usando respaldo embebido", e);
    }

    // Detectar idioma (localStorage > navegador > default "es")
    let selectedLang = localStorage.getItem("lang");
    if (!selectedLang) {
      selectedLang = navigator.language && navigator.language.startsWith("en") ? "en" : "es";
    }

    // Exponer y aplicar con reaplicación
    window.allTexts = finalTexts;
    initApplyReapply(selectedLang, finalTexts);
    console.log("[i18n] Idioma inicial:", selectedLang);
  }

  // --- 6. API pública para cambiar idioma ---
  window.setLanguage = function (lang) {
    localStorage.setItem("lang", lang);
    if (window.allTexts) {
      initApplyReapply(lang, window.allTexts);
    } else {
      location.reload();
    }
  };

  // --- 7. ARRANQUE ---
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }
})();
