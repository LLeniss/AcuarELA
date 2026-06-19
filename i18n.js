// i18n.js - carga data/textos.json y aplica traducciones.
// Diseño simple: busca atributos data-i18n, data-i18n-html y data-i18n-attr
(function(){
  const TEXTS_URL = "data/textos.json?t=" + Date.now();
  let TEXTS = {}; // fallback if fetch fails

  async function loadTexts(){
    try{
      const res = await fetch(TEXTS_URL, { cache: "no-store" });
      if(!res.ok) throw new Error("HTTP " + res.status);
      TEXTS = await res.json();
      console.info("[i18n] textos cargados desde data/textos.json");
    } catch(err){
      console.warn("[i18n] No se pudo cargar data/textos.json:", err.message);
      // fallback minimal
      TEXTS = {
        "es": {},
        "en": {},
        "fr": {}
      };
    }
  }

  function translatePage(lang){
    if(!TEXTS[lang]) lang = "es";
    // text nodes
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      const txt = (TEXTS[lang] && TEXTS[lang][key]) || el.textContent || "";
      el.textContent = txt;
    });
    // HTML content
    document.querySelectorAll("[data-i18n-html]").forEach(el=>{
      const key = el.getAttribute("data-i18n-html");
      const txt = (TEXTS[lang] && TEXTS[lang][key]) || el.innerHTML || "";
      el.innerHTML = txt;
    });
    // attribute mappings like data-i18n-attr="href:contact_mail"
    document.querySelectorAll("[data-i18n-attr]").forEach(el=>{
      const map = el.getAttribute("data-i18n-attr"); // "href:contact_mail"
      const parts = map.split(",").map(p => p.trim());
      parts.forEach(pair=>{
        const [attr, key] = pair.split(":").map(s => s.trim());
        const val = (TEXTS[lang] && TEXTS[lang][key]) || null;
        if(val !== null) el.setAttribute(attr, val);
      });
    });
  }

  function setupLangSwitcher(){
    document.querySelectorAll(".lang-switch__btn").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const lang = btn.getAttribute("data-lang");
        localStorage.setItem("lang", lang);
        translatePage(lang);
      });
    });
  }

  async function init(){
    await loadTexts();
    setupLangSwitcher();
    const saved = localStorage.getItem("lang") || navigator.language.slice(0,2) || "es";
    const lang = ["es","en","fr"].includes(saved) ? saved : "es";
    translatePage(lang);
  }

  window.addEventListener("DOMContentLoaded", init);
  // export for debugging
  window.__i18n = { translatePage };
})();
