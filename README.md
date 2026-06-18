# Eduvina Parada Cáceres · Landing solidaria (multilingüe ES/EN/FR)

Página web estática (HTML + CSS + JS mínimo) para acompañar la primera exposición de **Eduvina Parada Cáceres**, artista de acuarela que vive con ELA bulbar. El enfoque es **artista + obra + apoyo**: su obra está a la venta y el proyecto continúa más allá del evento.

> **Mensaje central:** *Ella es artista. Vive con ELA bulbar. Mañana exhibe su primera obra. Puedes ayudar a que este camino continúe.*

La página está pensada para lograr **3 acciones en 30 segundos**: **Donar**, **Comprar/Reservar la obra** y **Compartir**.

---

## 📁 Estructura del proyecto

```
landing_exposicion/
├── index.html      → Página completa (9 bloques) con marcado i18n
├── i18n.js         → Traducciones (ES/EN/FR) + motor de idiomas + botón compartir + año
├── styles.css      → Estilos responsive (mobile-first)
├── README.md       → Este archivo
├── _headers        → Cabeceras de seguridad/caché para Cloudflare
└── images/
    ├── hero.jpg     → Foto principal del hero (~1600×1000, horizontal)
    ├── artista.jpg  → Retrato de la artista (~800×1000, vertical)
    ├── obra-1.jpg   → La obra principal a la venta (~800×800, cuadrada)
    ├── obra-2.jpg / obra-3.jpg → Reserva para futuras obras (ver "Escalar")
    ├── og-image.jpg → Imagen al compartir en redes (1200×630)
    └── favicon.png  → Ícono de la pestaña
```

> Las imágenes son **placeholders**. Reemplázalas por las reales manteniendo el mismo nombre (o cambia la ruta en `index.html`).

---

## 🌍 Multilingüe (ES / EN / FR)

El sitio cambia de idioma **sin recargar la página**. Funciona así:

- En `index.html`, cada texto traducible lleva un atributo:
  - `data-i18n="clave"` → cambia el **texto**.
  - `data-i18n-html="clave"` → cambia el **HTML** (permite `<strong>`, `<br>`, enlaces).
  - `data-i18n-attr="content:clave"` → cambia un **atributo** (ej. la meta-descripción).
- Todas las traducciones viven en `i18n.js`, en el objeto `TRANSLATIONS` (bloques `es`, `en`, `fr`).
- El idioma se recuerda en el navegador (localStorage) y al volver se mantiene.

### ✏️ Cómo editar un texto
1. Abre `i18n.js`.
2. Busca la **clave** del texto (ej. `hero_title`).
3. Edítala en los tres idiomas (`es`, `en`, `fr`).
> No edites el texto directamente en `index.html`: el contenido visible lo controla `i18n.js`.

### ➕ Cómo añadir un idioma nuevo (ej. portugués)
1. En `i18n.js`, copia el bloque `es: { ... }` completo, renómbralo a `pt: { ... }` y traduce los valores.
2. En `index.html`, dentro de `<div class="lang-switch">`, añade un botón:
   ```html
   <button class="lang-switch__btn" data-lang="pt">PT</button>
   ```
¡Listo! El selector lo detecta automáticamente.

### ➕ Cómo añadir un texto nuevo traducible
1. Inventa una clave (ej. `nueva_seccion_titulo`).
2. Añádela en `es`, `en` y `fr` dentro de `i18n.js`.
3. En el HTML, pon el atributo en el elemento: `data-i18n="nueva_seccion_titulo"`.

---

## ✏️ Qué editar (contenido real)

Los datos a reemplazar están marcados con **corchetes** `[ASÍ]` y comentarios `<!-- EDITAR: ... -->`.

| Qué | Dónde |
|-----|-------|
| Textos visibles (títulos, párrafos, etc.) | `i18n.js` (objeto `TRANSLATIONS`) |
| Historia de Eduvina (3 párrafos) | `i18n.js` → claves `historia_p1/p2/p3` |
| Ficha de la obra (técnica, medidas, año, precio) | `i18n.js` → claves `obra_ficha_*` y `obra_precio` |
| Cuentas de donación (Nequi, Daviplata, banco) | `i18n.js` → claves `donar_*` |
| Enlace de GoFundMe | `index.html` → bloque `donacion-card--highlight` (atributo `href`) |
| Datos del evento (fecha, hora, lugar) | `i18n.js` → claves `evento_*` |
| Contacto (correo, WhatsApp, Instagram) | `index.html` → sección `#contacto` (atributos `href`) + textos visibles |
| SEO / redes (URL, imágenes) | `index.html` → `<head>` (Open Graph, Twitter, canonical) |
| Datos para Google | `index.html` → bloque `application/ld+json` |

### 🖼 Cómo cambiar las imágenes
Reemplaza los archivos dentro de `images/` **manteniendo el mismo nombre**:
- `hero.jpg` → foto de impacto (la obra o la artista) para la portada.
- `artista.jpg` → retrato de Eduvina.
- `obra-1.jpg` → la obra principal a la venta.
- `og-image.jpg` → imagen atractiva (1200×630) para WhatsApp/Facebook/Twitter.
Si prefieres otro nombre o formato, actualiza la ruta en `index.html` (atributos `src` / `background-image` / meta `og:image`).

### 🎨 Cómo cambiar los colores
En `styles.css`, edita las variables de `:root` (ej. `--color-primary` para el acento terracota, `--color-accent` para el dorado de "comprar").

---

## 🚀 Desplegar en Cloudflare Pages

Es un sitio 100% estático: no requiere compilación.

### Opción A — Subir archivos (la más sencilla)
1. Entra en [dash.cloudflare.com](https://dash.cloudflare.com/) (crea una cuenta gratuita si no la tienes).
2. **Workers & Pages** → pestaña **Pages** → **Create application** → **Upload assets**.
3. Nombra el proyecto (ej. `eduvina-arte`).
4. Arrastra **el contenido** de la carpeta `landing_exposicion` (los archivos `index.html`, `i18n.js`, `styles.css`, `_headers` y la carpeta `images`).
5. **Deploy site**. Obtendrás una URL tipo `https://eduvina-arte.pages.dev`.

### Opción B — Conectar un repositorio Git (recomendada para actualizar)
1. Sube esta carpeta a GitHub/GitLab.
2. Cloudflare Pages → **Create application** → **Connect to Git** → elige el repo.
3. Build: **Framework preset:** `None` · **Build command:** *(vacío)* · **Output directory:** `/`.
4. **Save and Deploy**. Cada `git push` actualiza el sitio automáticamente.

### Dominio propio (opcional)
En el proyecto de Pages → **Custom domains** → **Set up a domain**. Luego actualiza la URL en las etiquetas `canonical`, Open Graph y Schema.org de `index.html`.

---

## 📈 Cómo escalar la página después

La estructura está pensada para crecer sin rehacer nada:

- **Añadir más obras (galería):** hoy hay una "ficha de obra" única. Cuando haya varias:
  1. Reutiliza `obra-2.jpg`, `obra-3.jpg`, etc. en `images/`.
  2. Duplica el bloque `.obra-card` (o crea una grilla de tarjetas) en `index.html`.
  3. Añade sus textos en `i18n.js` con claves nuevas (`obra2_titulo`, `obra2_precio`...).
- **Sección de galería/portafolio:** crea una nueva `<section>` siguiendo el patrón de las existentes y enlázala desde el menú (`.nav__links`).
- **Boletín / lista de correo:** el botón "Quiero estar al tanto" (sección *Esto recién empieza*) apunta hoy a contacto; puedes conectarlo a un formulario (Mailchimp, Tally, etc.).
- **Más idiomas:** ver la sección Multilingüe arriba.
- **Pasarela de pago / tienda:** el botón "Reservar esta obra" puede enlazar a un checkout (ej. enlace de pago, Gumroad, etc.) cambiando su `href`.

---

## 💡 Notas técnicas

- **JavaScript mínimo:** `i18n.js` solo hace 3 cosas — cambiar idioma, mostrar el año del footer y el botón "Compartir" (usa la API nativa *Web Share*; en escritorio copia el enlace al portapapeles).
- **FAQ sin JS:** el acordeón usa `<details>`/`<summary>` nativos del navegador.
- **Responsive** (mobile-first): se ve bien en teléfono, tablet y computador.
- **SEO:** meta tags, Open Graph, Twitter Cards y Schema.org (`VisualArtsEvent` + `VisualArtwork` + `Person`). Valídalo en la [Prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results).
- No requiere servidor: funciona abriendo `index.html` en cualquier navegador.
