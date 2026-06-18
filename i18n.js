// loadRemoteTextOverrides + merge seguro
async function loadRemoteTextOverrides(TRANSLATIONS) {
  try {
    const url = "/data/textos.json?v=" + Date.now();
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) {
      console.info(`[i18n] No hay texto remoto disponible (${resp.status}) — usando embebido`);
      return TRANSLATIONS;
    }
    const remote = await resp.json();

    // Opcional: control de versión simple
    const remoteVersion = remote._version || null;
    const localVersion = TRANSLATIONS._version || null;
    if (remoteVersion && localVersion && remoteVersion === localVersion) {
      console.info(`[i18n] versión remota (${remoteVersion}) = versión embebida (${localVersion}) — aplicando overrides igual`);
    } else if (remoteVersion && localVersion && remoteVersion < localVersion) {
      console.warn(`[i18n] versión remota (${remoteVersion}) < versión embebida (${localVersion}) — igual aplicando overrides, revisar si es intencional`);
    } else if (remoteVersion) {
      console.info(`[i18n] versión remota detectada: ${remoteVersion}`);
    }

    // Merge superficial: por idioma y por clave (remote override wins)
    const merged = Object.assign({}, TRANSLATIONS); // copia superficial de top-level
    Object.keys(remote).forEach((lang) => {
      if (lang === "_version" || lang === "_updated_at") {
        merged[lang] = remote[lang]; // pasar metadatos si los hubiera
        return;
      }
      if (typeof remote[lang] !== "object") return;
      if (!merged[lang]) merged[lang] = {};
      Object.keys(remote[lang]).forEach((key) => {
        const before = merged[lang][key];
        merged[lang][key] = remote[lang][key];
        if (before === undefined) {
          console.info(`[i18n] (remote) nueva clave "${key}" para idioma "${lang}"`);
        } else if (before !== merged[lang][key]) {
          console.info(`[i18n] (remote override) "${lang}.${key}" — antes: ${String(before).slice(0,40)} ... ahora: ${String(merged[lang][key]).slice(0,40)} ...`);
        }
      });
    });

    console.info("[i18n] Overrides remotos aplicados (si existían)");
    return merged;
  } catch (err) {
    console.warn("[i18n] No se pudo cargar /data/textos.json — usando embebido", err);
    return TRANSLATIONS;
  }
}
