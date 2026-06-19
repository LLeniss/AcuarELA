/**
 * i18n.js - carga data/textos.json?t=TIMESTAMP (cache-busted) y aplica traducciones.
 * - Soporta data-i18n, data-i18n-html, data-i18n-attr ("attr:key").
 * - Maneja selector de idioma [data-lang].
 * - Añade handlers para:
 *    - [data-reserve] -> abre WhatsApp con mensaje pre-llenado (usa data-reserve-title-key para título)
 *    - [data-share] -> Web Share o fallback
 */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '573155427152'; // formato internacional (sin +)

  const TRANSLATIONS = {
    "es": {
      "meta_title": "Eduvina Parada Cáceres · Su primera obra",
      "meta_desc": "Eduvina Parada —Vina— presenta su primera acuarela. Tu aporte ayuda a financiar su cuidado y su arte.",
      "site_name": "Eduvina Parada Cáceres",
      "nav_historia": "Historia",
      "nav_obra": "La obra",
      "nav_catalogo": "Catálogo",
      "nav_ayudar": "Cómo ayudar",
      "nav_evento": "Evento",
      "nav_cta": "Donar",
      "hero_kicker": "Primera obra en exposición",
      "hero_title": "Ella es artista. Y esto recién empieza.",
      "hero_subtitle": "Eduvina Parada —Vina— presenta su primera acuarela. Tu apoyo hace posible que siga creando.",
      "hero_btn_donar": "❤ Donar ahora",
      "hero_btn_reservar": "🖼 Reservar / comprar",
      "historia_title": "Una artista que encontró su voz en el color",
      "historia_p1": "Eduvina Parada Cáceres —Vina—, es una artista bumanguesa. En sus acuarelas, los materiales y las emociones se encuentran para crear luz e instantes de serenidad.",
      "historia_p2": "Vive con ELA bulbar, una condición que afecta inicialmente el habla y la deglución, y progresivamente agota capacidades físicas. Sin embargo, mantiene intactas sus capacidades cognitivas; pintar es su forma de comunicarse ahora que su cuerpo y sus palabras encuentran límites.",
      "historia_p3": "El 19 de Junio de 2026 su obra se exhibe por primera vez. Cada acuarela que encuentra un hogar hace posible que Vina siga pintando y financiando los cuidados que su salud requiere.",
      "obra_title": "Su primera acuarela a la venta",
      "obra_nombre": "Su primera acuarela",
      "obra_ficha_tecnica_label": "Técnica:",
      "obra_ficha_tecnica": "Acuarela sobre papel de algodón",
      "obra_ficha_medidas_label": "Medidas:",
      "obra_ficha_medidas": "30 × 40 cm",
      "obra_ficha_anio_label": "Año:",
      "obra_ficha_anio": "2026",
      "obra_ficha_estado_label": "Disponibilidad:",
      "obra_ficha_estado": "Disponible",
      "obra_precio_label": "Precio / aporte sugerido:",
      "obra_precio": "[$ 000.000 COP]",
      "obra_btn": "Reservar esta obra",
      "catalogo_title": "Una colección que crece",
      "catalogo_lead": "Explora las piezas disponibles. Cada compra apoya su cuidado y nuevos materiales.",
      "ayudar_title": "Elige cómo acompañar este camino",
      "ayudar_1_title": "Donar",
      "ayudar_1_text": "Aporta lo que puedas para su cuidado y su arte.",
      "ayudar_1_btn": "Donar por Bre‑B",
      "ayudar_2_title": "Reservar",
      "ayudar_2_text": "Reserva una acuarela y contribuye directamente.",
      "ayudar_2_btn": "Reservar obra",
      "ayudar_3_title": "Compartir",
      "ayudar_3_text": "Comparte la historia y el evento con tu red.",
      "ayudar_3_btn": "Compartir",
      "donar_title": "Dona por Bre‑B",
      "donar_lead": "Tu aporte llega directamente al bienestar de Eduvina. Gracias por apoyar su cuidado y su arte.",
      "donar_breb_title": "Bre‑B",
      "donar_breb_num": "Número: <strong>315 542 7152</strong>",
      "donar_breb_name": "A nombre de Eduvina Parada",
      "fondos_title": "¿A dónde va tu aporte?",
      "fondos_1_title": "Tratamiento y terapias",
      "fondos_1_text": "Financiamos consultas, medicamentos y terapias necesarias para su cuidado.",
      "fondos_2_title": "Comunicación asistida",
      "fondos_2_text": "Dispositivos para que pueda comunicarse y ser escuchada.",
      "fondos_3_title": "Materiales de arte",
      "fondos_3_text": "Acuarelas, papel y suministros que le permiten seguir creando.",
      "fondos_4_title": "Cuidado diario",
      "fondos_4_text": "Apoyo para alimentación, transporte y cuidados básicos.",
      "evento_title": "Exposición pública",
      "evento_fecha_label": "Fecha:",
      "evento_fecha": "Viernes 19 de junio de 2026",
      "evento_lugar_label": "Lugar:",
      "evento_lugar": "Museo Casa Galán · Calle 36 # 24-74, Bucaramanga",
      "contacto_title": "¿Hablamos?",
      "contact_email": "vinapc2611@gmail.com",
      "contact_mail": "mailto:vinapc2611@gmail.com",
      "contact_whatsapp_text": "315 542 7152",
      "contact_whatsapp_href": "https://wa.me/573155427152",
      "whatsapp_reserve_msg": "Hola, quiero reservar la obra \"{title}\". ¿Me indican el proceso, por favor? Mi correo: vinapc2611@gmail.com",
      "whatsapp_contact_msg": "Hola, deseo información sobre la obra y el evento. Muchas gracias.",
      "footer_copy": "Hecho con cariño y esperanza."
    },
    "en": {
      "meta_title": "Eduvina Parada Cáceres · Her first artwork",
      "meta_desc": "Eduvina Parada —Vina— presents her first watercolor. Your contribution helps fund her care and art.",
      "site_name": "Eduvina Parada Cáceres",
      "nav_historia": "Story",
      "nav_obra": "Artwork",
      "nav_catalogo": "Catalog",
      "nav_ayudar": "How to help",
      "nav_evento": "Event",
      "nav_cta": "Donate",
      "hero_kicker": "First public showing",
      "hero_title": "She is an artist. And this is just the beginning.",
      "hero_subtitle": "Eduvina Parada —Vina— presents her first watercolor. Your support makes it possible for her to keep creating.",
      "hero_btn_donar": "❤ Donate now",
      "hero_btn_reservar": "🖼 Reserve / buy",
      "historia_title": "An artist who found her voice in color",
      "historia_p1": "Eduvina Parada Cáceres —Vina— is an artist from Bucaramanga. In her watercolors, materials and emotions meet to create light and moments of serenity.",
      "historia_p2": "She lives with bulbar ALS, a condition that initially affects speech and swallowing and progressively weakens physical abilities. However, she retains her cognitive abilities; painting is her way of communicating now that her body and words encounter limits.",
      "historia_p3": "On June 19, 2026 her work is exhibited publicly for the first time. Each watercolor that finds a home makes it possible for Vina to keep painting and funding the care she needs.",
      "obra_title": "Her first watercolor for sale",
      "obra_nombre": "First watercolor",
      "obra_ficha_tecnica_label": "Technique:",
      "obra_ficha_tecnica": "Watercolor on cotton paper",
      "obra_ficha_medidas_label": "Size:",
      "obra_ficha_medidas": "30 × 40 cm",
      "obra_ficha_anio_label": "Year:",
      "obra_ficha_anio": "2026",
      "obra_ficha_estado_label": "Availability:",
      "obra_ficha_estado": "Available",
      "obra_precio_label": "Price / suggested donation:",
      "obra_precio": "[$ 000.000 COP]",
      "obra_btn": "Reserve this artwork",
      "catalogo_title": "A growing collection",
      "catalogo_lead": "Explore available pieces. Every purchase supports her care and new materials.",
      "ayudar_title": "Choose how to support this path",
      "ayudar_1_title": "Donate",
      "ayudar_1_text": "Contribute what you can for her care and art.",
      "ayudar_1_btn": "Donate via Bre‑B",
      "ayudar_2_title": "Reserve",
      "ayudar_2_text": "Reserve a watercolor and contribute directly.",
      "ayudar_2_btn": "Reserve artwork",
      "ayudar_3_title": "Share",
      "ayudar_3_text": "Share the story and event with your network.",
      "ayudar_3_btn": "Share",
      "donar_title": "Donate via Bre‑B",
      "donar_lead": "Your contribution goes directly to Eduvina's wellbeing. Thank you for supporting her care and art.",
      "donar_breb_title": "Bre‑B",
      "donar_breb_num": "Number: <strong>315 542 7152</strong>",
      "donar_breb_name": "In the name of Eduvina Parada",
      "fondos_title": "Where your contribution goes",
      "fondos_1_title": "Treatment and therapy",
      "fondos_1_text": "We fund consultations, medication and therapies needed for her care.",
      "fondos_2_title": "Communication support",
      "fondos_2_text": "Devices that allow her to communicate and be heard.",
      "fondos_3_title": "Art materials",
      "fondos_3_text": "Watercolors, paper and supplies that let her keep creating.",
      "fondos_4_title": "Daily care",
      "fondos_4_text": "Support for food, transport and basic care.",
      "evento_title": "Public exhibition",
      "evento_fecha_label": "Date:",
      "evento_fecha": "Friday, June 19, 2026",
      "evento_lugar_label": "Location:",
      "evento_lugar": "Museo Casa Galán · Calle 36 # 24-74, Bucaramanga",
      "contacto_title": "Let's talk",
      "contact_email": "vinapc2611@gmail.com",
      "contact_mail": "mailto:vinapc2611@gmail.com",
      "contact_whatsapp_text": "315 542 7152",
      "contact_whatsapp_href": "https://wa.me/573155427152",
      "whatsapp_reserve_msg": "Hello, I would like to reserve the artwork \"{title}\". Could you please tell me the process? My email: vinapc2611@gmail.com",
      "whatsapp_contact_msg": "Hello, I want information about the artwork and the event. Thank you.",
      "footer_copy": "Made with care and hope."
    },
    "fr": {
      "meta_title": "Eduvina Parada Cáceres · Sa première œuvre",
      "meta_desc": "Eduvina Parada —Vina— présente sa première aquarelle. Votre contribution aide à financer ses soins et son art.",
      "site_name": "Eduvina Parada Cáceres",
      "nav_historia": "Histoire",
      "nav_obra": "Œuvre",
      "nav_catalogo": "Catalogue",
      "nav_ayudar": "Comment aider",
      "nav_evento": "Événement",
      "nav_cta": "Don",
      "hero_kicker": "Première exposition",
      "hero_title": "Elle est artiste. Et ce n'est que le début.",
      "hero_subtitle": "Eduvina Parada —Vina— présente sa première aquarelle. Votre soutien lui permet de continuer à créer.",
      "hero_btn_donar": "❤ Faire un don",
      "hero_btn_reservar": "🖼 Réserver / acheter",
      "historia_title": "Une artiste qui a trouvé sa voix dans la couleur",
      "historia_p1": "Eduvina Parada Cáceres —Vina— est une artiste de Bucaramanga. Dans ses aquarelles, matériaux et émotions se rencontrent pour créer lumière et instants de sérénité.",
      "historia_p2": "Elle vit avec la SLA bulbaire, une affection progressive qui affecte d'abord la parole et la déglutition et qui affaiblit progressivement les capacités physiques. Cependant, elle conserve intactes ses capacités cognitives ; peindre est son moyen de communiquer maintenant que son corps et ses mots trouvent leurs limites.",
      "historia_p3": "Le 19 juin 2026, son travail est exposé publiquement pour la première fois. Chaque aquarelle qui trouve un foyer permet à Vina de continuer à peindre et à financer les soins nécessaires.",
      "obra_title": "Sa première aquarelle à la vente",
      "obra_nombre": "Première aquarelle",
      "obra_ficha_tecnica_label": "Technique :",
      "obra_ficha_tecnica": "Aquarelle sur papier de coton",
      "obra_ficha_medidas_label": "Dimensions :",
      "obra_ficha_medidas": "30 × 40 cm",
      "obra_ficha_anio_label": "Année :",
      "obra_ficha_anio": "2026",
      "obra_ficha_estado_label": "Disponibilité :",
      "obra_ficha_estado": "Disponible",
      "obra_precio_label": "Prix / don suggéré :",
      "obra_precio": "[$ 000.000 COP]",
      "obra_btn": "Réserver cette œuvre",
      "catalogo_title": "Une collection qui grandit",
      "catalogo_lead": "Explorez les pièces disponibles. Chaque achat soutient ses soins et de nouveaux matériaux.",
      "ayudar_title": "Choisissez comment accompagner ce chemin",
      "ayudar_1_title": "Donner",
      "ayudar_1_text": "Contribuez ce que vous pouvez pour ses soins et son art.",
      "ayudar_1_btn": "Don via Bre‑B",
      "ayudar_2_title": "Réserver",
      "ayudar_2_text": "Réservez une aquarelle et contribuez directement.",
      "ayudar_2_btn": "Réserver œuvre",
      "ayudar_3_title": "Partager",
      "ayudar_3_text": "Partagez l'histoire et l'événement avec votre réseau.",
      "ayudar_3_btn": "Partager",
      "donar_title": "Don via Bre‑B",
      "donar_lead": "Votre contribution va directement au bien-être d'Eduvina. Merci de soutenir ses soins et son art.",
      "donar_breb_title": "Bre‑B",
      "donar_breb_num": "Numéro : <strong>315 542 7152</strong>",
      "donar_breb_name": "Au nom d'Eduvina Parada",
      "fondos_title": "Où va votre contribution",
      "fondos_1_title": "Traitement et thérapies",
      "fondos_1_text": "Nous finançons consultations, médicaments et thérapies nécessaires.",
      "fondos_2_title": "Support à la communication",
      "fondos_2_text": "Dispositifs pour qu'elle puisse communiquer et être entendue.",
      "fondos_3_title": "Matériaux d'art",
      "fondos_3_text": "Aquarelles, papier et fournitures pour continuer à créer.",
      "fondos_4_title": "Soins quotidiens",
      "fondos_4_text": "Soutien pour alimentation, transport et soins de base.",
      "evento_title": "Exposition publique",
      "evento_fecha_label": "Date :",
      "evento_fecha": "19 juin 2026",
      "evento_lugar_label": "Lieu :",
      "evento_lugar": "Museo Casa Galán · Calle 36 # 24-74, Bucaramanga",
      "contacto_title": "Contact",
      "contact_email": "vinapc2611@gmail.com",
      "contact_mail": "mailto:vinapc2611@gmail.com",
      "contact_whatsapp_text": "315 542 7152",
      "contact_whatsapp_href": "https://wa.me/573155427152",
      "whatsapp_reserve_msg": "Bonjour, je souhaite réserver l'œuvre \"{title}\". Pouvez-vous m'indiquer la procédure ? Mon email : vinapc2611@gmail.com",
      "whatsapp_contact_msg": "Bonjour, je souhaite des informations sur l'œuvre et l'événement. Merci.",
      "footer_copy": "Fait avec soin et espoir."
    }
  };

  let translations = TRANSLATIONS;

  function t(lang, key) {
    return (translations[lang] && translations[lang][key]) || (TRANSLATIONS['es'] && TRANSLATIONS['es'][key]) || '';
  }

  function applyTranslations(lang) {
    try {
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        const v = t(lang, key);
        if (v !== '') el.textContent = v;
      });

      document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
        const key = el.getAttribute('data-i18n-html');
        const v = t(lang, key);
        if (v !== '') el.innerHTML = v;
      });

      document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
        const spec = el.getAttribute('data-i18n-attr');
        spec.split(';').forEach(function (pair) {
          const parts = pair.split(':');
          if (parts.length === 2) {
            const attrName = parts[0].trim();
            const key = parts[1].trim();
            const v = t(lang, key);
            if (v !== '') el.setAttribute(attrName, v);
          }
        });
      });

      const mt = t(lang, 'meta_title');
      if (mt) document.title = mt;
      const md = t(lang, 'meta_desc');
      if (md) {
        document.querySelectorAll('meta[name="description"]').forEach(m => m.setAttribute('content', md));
      }

      // set contact mail/href & whatsapp link if present (fallbacks already handled via data-i18n-attr)
      document.querySelectorAll('[data-reserve]').forEach(function (btn) {
        // if element has data-reserve-title-key, set data-title to translated title
        const k = btn.getAttribute('data-reserve-title-key');
        if (k) {
          const title = t(lang, k) || '';
          btn.setAttribute('data-title', title);
        }
      });

      attachReserveHandlers(lang);
      localStorage.setItem('lang', lang);
      console.log('[i18n] Applied translations for', lang);
    } catch (err) {
      console.error('[i18n] Error applying translations', err);
    }
  }

  function attachReserveHandlers(lang) {
    const msgTemplate = t(lang, 'whatsapp_reserve_msg') || TRANSLATIONS['es']['whatsapp_reserve_msg'];
    document.querySelectorAll('[data-reserve]').forEach(function (btn) {
      btn.removeEventListener('click', reserveHandler);
      btn.addEventListener('click', reserveHandler);
    });

    function reserveHandler(ev) {
      ev.preventDefault();
      const btn = ev.currentTarget;
      const title = (btn.getAttribute('data-title') || '').trim();
      let msg = msgTemplate.replace('{title}', title || '');
      msg = msg.replace(/\s+/g, ' ').trim();
      const encoded = encodeURIComponent(msg);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
      window.open(url, '_blank');
    }

    document.querySelectorAll('[data-share]').forEach(function (el) {
      el.removeEventListener('click', shareHandler);
      el.addEventListener('click', shareHandler);
    });

    function shareHandler(ev) {
      ev.preventDefault();
      const langMsg = t(lang, 'hero_subtitle') || '';
      const shareData = {
        title: document.title,
        text: langMsg,
        url: location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        window.prompt('Copy this link to share', location.href);
      }
    }
  }

  function initLangSwitcher(defaultLang) {
    const stored = localStorage.getItem('lang');
    const initial = stored || defaultLang || 'es';
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const chosen = btn.getAttribute('data-lang');
        setActiveLangButton(chosen);
        applyTranslations(chosen);
      });
    });
    setActiveLangButton(initial);
    applyTranslations(initial);
  }

  function setActiveLangButton(lang) {
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  function loadTranslations() {
    const url = 'data/textos.json?t=' + Date.now();
    fetch(url, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        translations = data;
        console.log('[i18n] Loaded data/textos.json (ok)');
        initLangSwitcher(detectBrowserLang());
      })
      .catch(function (err) {
        console.warn('[i18n] Using fallback translations (could not load data/textos.json):', err);
        translations = TRANSLATIONS;
        initLangSwitcher(detectBrowserLang());
      });
  }

  function detectBrowserLang() {
    const stored = localStorage.getItem('lang');
    if (stored) return stored;
    const nav = navigator.language || navigator.userLanguage || 'es';
    const lang = nav.toLowerCase().indexOf('fr') === 0 ? 'fr' : (nav.toLowerCase().indexOf('en') === 0 ? 'en' : 'es');
    return lang;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTranslations);
  } else {
    loadTranslations();
  }

})();
