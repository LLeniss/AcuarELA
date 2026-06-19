// app.js - maneja el catálogo, modal, botones de WhatsApp y compartir
(function(){
  // load config.json tag (inlined as <script src="config.json" type="application/json"></script>)
  function loadConfigScript(){
    const scripts = document.querySelectorAll('script[type="application/json"]');
    for(const s of scripts){
      try{
        const json = JSON.parse(s.innerText || s.textContent);
        if(json && json.obras) return json;
      } catch(e){}
    }
    return null;
  }

  function formatWhatsAppMessage(obTitle){
    const base = `Hola, estoy interesado(a) en la obra "${obTitle}" — me gustaría obtener más información y/o adquirirla.`;
    return encodeURIComponent(base);
  }

  function buildCatalog(cfg, lang){
    const grid = document.getElementById("catalogo-grid");
    grid.innerHTML = "";
    cfg.obras.forEach(ob=>{
      const card = document.createElement("article");
      card.className = "card";
      const img = document.createElement("img");
      img.className = "card__img";
      img.src = ob.imagen;
      img.alt = (ob.titulo && (ob.titulo[lang]||ob.titulo.es)) || "";
      img.loading = "lazy";
      card.appendChild(img);

      const h4 = document.createElement("h4");
      h4.textContent = (ob.titulo && (ob.titulo[lang]||ob.titulo.es)) || "—";
      card.appendChild(h4);

      const p = document.createElement("p");
      p.textContent = (ob.descripcion && (ob.descripcion[lang]||ob.descripcion.es)) || "";
      card.appendChild(p);

      const meta = document.createElement("div");
      meta.className = "card__meta";

      const state = document.createElement("small");
      state.textContent = (ob.estado && (ob.estado[lang]||ob.estado.es)) || "";
      meta.appendChild(state);

      const actions = document.createElement("div");
      actions.style.display="flex"; actions.style.gap="8px";
      const view = document.createElement("button");
      view.className = "btn btn--ghost";
      view.textContent = (lang==="en"?"View":"Ver");
      view.addEventListener("click", ()=> openModal(ob, lang));
      actions.appendChild(view);

      if(ob.precio){
        const collect = document.createElement("a");
        collect.className = "btn btn--primary";
        collect.textContent = (lang==="en"?"Collect":"Coleccionar");
        const wa = cfg.contact.whatsapp + "?text=" + formatWhatsAppMessage(ob.titulo[lang]||ob.titulo.es);
        collect.href = wa;
        collect.target = "_blank";
        collect.rel = "noopener";
        actions.appendChild(collect);
      } else {
        // in-progress: show enquire to reserve (also whatsapp)
        const collect = document.createElement("a");
        collect.className = "btn btn--primary";
        collect.textContent = (lang==="en"?"Enquire":"Consultar");
        const wa = cfg.contact.whatsapp + "?text=" + formatWhatsAppMessage(ob.titulo[lang]||ob.titulo.es);
        collect.href = wa; collect.target="_blank"; collect.rel="noopener";
        actions.appendChild(collect);
      }

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
    img.alt = ob.titulo[lang] || ob.titulo.es;
    title.textContent = ob.titulo[lang] || ob.titulo.es;
    desc.textContent = ob.descripcion[lang] || ob.descripcion.es;

    ficha.innerHTML = "";
    const li1 = document.createElement("li");
    li1.innerHTML = `<strong>${ (lang==="en"?"Technique":"Técnica") }:</strong> ${ob.tecnica || ""}`;
    ficha.appendChild(li1);
    const li2 = document.createElement("li");
    li2.innerHTML = `<strong>${ (lang==="en"?"Size":"Dimensiones") }:</strong> ${ob.dimensiones || ""}`;
    ficha.appendChild(li2);
    const li3 = document.createElement("li");
    li3.innerHTML = `<strong>${ (lang==="en"?"Year":"Año") }:</strong> ${ob.anio || ""}`;
    ficha.appendChild(li3);
    const li4 = document.createElement("li");
    li4.innerHTML = `<strong>${ (lang==="en"?"Status":"Estado") }:</strong> ${ (ob.estado && (ob.estado[lang]||ob.estado.es)) || "" }`;
    ficha.appendChild(li4);

    // collect link
    const wa = cfg.contact.whatsapp + "?text=" + formatWhatsAppMessage(ob.titulo[lang]||ob.titulo.es);
    collect.href = wa;
    collect.target = "_blank";
    collect.rel = "noopener";
  }

  function closeModal(){
    modal.setAttribute("aria-hidden","true");
  }

  function setupModalEvents(){
    document.querySelectorAll("[data-close]").forEach(btn=>{
      btn.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", (e)=>{
      if(e.target === modal.querySelector(".modal__backdrop")) closeModal();
    });
  }

  // sharing
  function setupShare(){
    const shareBtn = document.getElementById("share-btn");
    shareBtn.addEventListener("click", async ()=>{
      const url = location.href;
      const title = document.querySelector("[data-i18n='site_name']")?.textContent || document.title;
      if(navigator.share){
        try{ await navigator.share({title, text: title, url}); }catch(e){}
      } else {
        // fallback: copy link
        navigator.clipboard?.writeText(url).then(()=>{
          alert("Link copiado: " + url);
        });
      }
    });
  }

  // language helper: reads localStorage or default
  function currentLang(){
    const saved = localStorage.getItem("lang");
    return (saved && ["es","en","fr"].includes(saved)) ? saved : (navigator.language.slice(0,2) || "es");
  }

  // build contact links
  function setupContactLinks(cfg, lang){
    const mail = document.getElementById("contact-mail");
    const waBtn = document.getElementById("contact-wa");
    if(mail) mail.setAttribute("href", cfg.contact.email);
    if(waBtn){
      waBtn.setAttribute("href", cfg.contact.whatsapp + "?text=" + encodeURIComponent((lang==="en"?"Hello, I would like to know more about your work.":"Hola, quisiera saber más sobre sus obras.")));
      waBtn.addEventListener("click", ()=>{}); // link opens in new tab
    }
  }

  // init
  const cfg = loadConfigScript();
  if(!cfg){
    console.error("config.json no cargado o inválido");
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    const lang = currentLang();
    buildCatalog(cfg || {obras:[]}, lang);
    setupModalEvents();
    setupShare();
    setupContactLinks(cfg, lang);

    // re-build on language change (observe localStorage changes)
    window.addEventListener("storage", (e)=>{
      if(e.key === "lang"){
        buildCatalog(cfg, e.newValue || "es");
        setupContactLinks(cfg, e.newValue || "es");
      }
    });
  });

})();
