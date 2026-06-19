// app.js - carga config.json mediante fetch, renderiza catálogo, modal y enlaces de contacto
(function(){
  const CONFIG_URL = "config.json?t=" + Date.now();

  async function loadConfig(){
    try{
      const res = await fetch(CONFIG_URL, { cache: "no-store" });
      if(!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      return json;
    } catch(err){
      console.error("[app] No se pudo cargar config.json:", err.message);
      return null;
    }
  }

  function formatWhatsAppMessage(obTitle, lang){
    const baseEs = `Hola, estoy interesado(a) en la obra "${obTitle}" — me gustaría obtener más información y/o adquirirla.`;
    const baseEn = `Hello, I'm interested in the artwork "${obTitle}" — I'd like more information or to acquire it.`;
    const baseFr = `Bonjour, je suis intéressé(e) par l'œuvre "${obTitle}" — je souhaite plus d'informations ou l'acquérir.`;
    const text = lang === "en" ? baseEn : (lang === "fr" ? baseFr : baseEs);
    return encodeURIComponent(text);
  }

  function currentLang(){
    const saved = localStorage.getItem("lang");
    return (saved && ["es","en","fr"].includes(saved)) ? saved : (navigator.language.slice(0,2) || "es");
  }

  function showEmptyMessage(show){
    const empty = document.getElementById("catalogo-empty");
    if(!empty) return;
    empty.hidden = !show;
  }

  function buildCatalog(cfg, lang){
    const grid = document.getElementById("catalogo-grid");
    grid.innerHTML = "";
    if(!cfg || !Array.isArray(cfg.obras) || cfg.obras.length === 0){
      showEmptyMessage(true);
      return;
    }
    showEmptyMessage(false);

    cfg.obras.forEach(ob=>{
      const card = document.createElement("article");
      card.className = "card";

      const img = document.createElement("img");
      img.className = "card__img";
      img.src = ob.imagen;
      img.alt = ob.titulo && (ob.titulo[lang] || ob.titulo.es) || "";
      img.loading = "lazy";
      card.appendChild(img);

      const h4 = document.createElement("h4");
      h4.textContent = ob.titulo && (ob.titulo[lang] || ob.titulo.es) || "—";
      card.appendChild(h4);

      const p = document.createElement("p");
      p.textContent = ob.descripcion && (ob.descripcion[lang] || ob.descripcion.es) || "";
      card.appendChild(p);

      const meta = document.createElement("div");
      meta.className = "card__meta";

      const state = document.createElement("small");
      state.textContent = ob.estado && (ob.estado[lang] || ob.estado.es) || "";
      meta.appendChild(state);

      const actions = document.createElement("div");
      actions.style.display="flex";
      actions.style.gap="8px";

      const viewBtn = document.createElement("button");
      viewBtn.className = "btn btn--ghost";
      viewBtn.textContent = lang === "en" ? "View" : (lang === "fr" ? "Voir" : "Ver");
      viewBtn.addEventListener("click", ()=> openModal(ob, lang));
      actions.appendChild(viewBtn);

      const collectLink = document.createElement("a");
      collectLink.className = "btn btn--primary";
      collectLink.textContent = lang === "en" ? "Collect" : (lang === "fr" ? "Collectionner" : "Coleccionar");
      const waBase = (cfg.contact && cfg.contact.whatsapp) ? cfg.contact.whatsapp : "https://wa.me/573155427152";
      collectLink.href = waBase + "?text=" + formatWhatsAppMessage(ob.titulo && (ob.titulo[lang] || ob.titulo.es) || "obra", lang);
      collectLink.target = "_blank";
      collectLink.rel = "noopener";
      actions.appendChild(collectLink);

      meta.appendChild(actions);
      card.appendChild(meta);

      grid.appendChild(card);
    });
  }

  // Modal
  const modal = document.getElementById("obra-modal");
  function openModal(ob, lang){
    modal.setAttribute("aria-hidden","false");
    const img = document.getElementById("modal-img");
    const title = document.getElementById("modal-title");
    const desc = document.getElementById("modal-desc");
    const ficha = document.getElementById("modal-ficha");
    const collect = document.getElementById("modal-collect");

    img.src = ob.imagen;
    img.alt = ob.titulo && (ob.titulo[lang] || ob.titulo.es) || "";
    title.textContent = ob.titulo && (ob.titulo[lang] || ob.titulo.es) || "";
    desc.textContent = ob.descripcion && (ob.descripcion[lang] || ob.descripcion.es) || "";

    ficha.innerHTML = "";
    const makeLi = (label, val) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${label}</strong> ${val || ""}`;
      return li;
    };
    ficha.appendChild(makeLi(lang==="en"?"Technique":"Técnica", ob.tecnica || ""));
    ficha.appendChild(makeLi(lang==="en"?"Size":"Dimensiones", ob.dimensiones || ""));
    ficha.appendChild(makeLi(lang==="en"?"Year":"Año", ob.anio || ""));
    ficha.appendChild(makeLi(lang==="en"?"Status":"Estado", ob.estado && (ob.estado[lang] || ob.estado.es) || ""));

    // set collect link
    loadConfig().then(cfg => {
      const waBase = (cfg && cfg.contact && cfg.contact.whatsapp) ? cfg.contact.whatsapp : "https://wa.me/573155427152";
      collect.href = waBase + "?text=" + formatWhatsAppMessage(ob.titulo && (ob.titulo[lang] || ob.titulo.es) || "obra", lang);
      collect.target = "_blank";
      collect.rel = "noopener";
    });
  }

  function closeModal(){
    modal.setAttribute("aria-hidden","true");
  }

  function setupModalEvents(){
    document.querySelectorAll("[data-close]").forEach(btn=>{
      btn.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", (e)=>{
      if(e.target.classList && e.target.classList.contains("modal__backdrop")) closeModal();
    });
  }

  // compartir
  function setupShare(){
    const shareBtn = document.getElementById("share-btn");
    shareBtn.addEventListener("click", async ()=>{
      const url = location.href;
      const title = document.querySelector("[data-i18n='site_name']")?.textContent || document.title;
      if(navigator.share){
        try{ await navigator.share({title, text: title, url}); }catch(e){}
      } else {
        try{
          await navigator.clipboard.writeText(url);
          alert((localStorage.getItem("lang")==="en") ? "Link copied to clipboard" : "Enlace copiado: " + url);
        }catch(e){
          window.open("mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(url));
        }
      }
    });
  }

  function setupContactLinks(cfg, lang){
    const mail = document.getElementById("contact-mail");
    const waBtn = document.getElementById("contact-wa");
    if(mail && cfg && cfg.contact && cfg.contact.email) mail.setAttribute("href", cfg.contact.email);
    if(waBtn && cfg && cfg.contact && cfg.contact.whatsapp){
      waBtn.setAttribute("href", cfg.contact.whatsapp + "?text=" + encodeURIComponent(lang==="en"?"Hello, I would like to learn about your works.":"Hola, quisiera saber más sobre sus obras."));
    }
  }

  // initialize
  document.addEventListener("DOMContentLoaded", async ()=>{
    const lang = currentLang();
    const cfg = await loadConfig();
    if(!cfg){
      // show empty state and console error
      document.getElementById("catalogo-grid").innerHTML = "";
      showEmptyMessage(true);
    } else {
      buildCatalog(cfg, lang);
      setupContactLinks(cfg, lang);
    }

    setupModalEvents();
    setupShare();

    // listen language changes (from i18n)
    window.addEventListener("storage", (e)=>{
      if(e.key === "lang"){
        const newLang = e.newValue || "es";
        loadConfig().then(cfg2 => { buildCatalog(cfg2 || {obras:[]}, newLang); setupContactLinks(cfg2, newLang); });
      }
    });
  });

})();
