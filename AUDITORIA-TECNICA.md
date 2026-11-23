# Auditoría técnica — Fudgo Web (HTML, CSS y JavaScript)

## Alcance revisado
- 8 páginas HTML: inicio, afiliación, sobre Fudgo, ayuda, gracias, términos/privacidad, 404 y leads.
- `styles.css`, `app.js`, `translations.json` y `.htaccess`.
- Rutas locales de recursos, referencias de traducción, sintaxis JSON/JavaScript y estructura general.
- Se conservaron las imágenes, iconos y demás recursos originales.

## Cambios aplicados
1. **Navegación consistente:** se unificó el encabezado de todas las páginas con el diseño del inicio. Esto evita que las páginas internas tengan una barra distinta y permite que el menú móvil y sus controles funcionen de manera homogénea.
2. **Efecto de desplazamiento:** se conectó el estado `is-scrolled` que el CSS ya contemplaba, activando el efecto de vidrio/blur al bajar por la página.
3. **Menú móvil y accesibilidad:** estado `aria-expanded`, cierre al seleccionar un enlace y con Escape, etiquetas accesibles para los controles.
4. **JavaScript más resistente:** manejo de errores al acceder a `localStorage`, validación de la respuesta de traducciones, manejo de errores HTTP, prevención de doble envío y restauración del botón si falla el formulario.
5. **Formulario:** el consentimiento ahora se incluye explícitamente en los datos enviados; se añadió un campo trampa básico para bots y se conserva la selección de ciudad personalizada y plan.
6. **Seguridad de enlaces:** se agregó `rel="noopener noreferrer"` a enlaces externos que abren otra pestaña.
7. **Recursos:** se corrigieron las referencias al favicon de páginas internas, que apuntaban a `favicon.ico` inexistente; ahora usan `Logo.ico`.
8. **SEO/privacidad del panel:** `leads.html` quedó marcado `noindex, nofollow`, ya que no es un panel administrativo real ni tiene autenticación.
9. **CSS:** foco visible para teclado, soporte para `prefers-reduced-motion` y ocultamiento accesible del campo trampa.
10. **Servidor:** se agregaron cabeceras básicas de seguridad a `.htaccess` dentro de una condición para `mod_headers`.

## Hallazgos que requieren decisión o trabajo adicional

### Prioridad alta — formulario y datos
- El formulario envía datos del navegador directamente a FormSubmit (`formsubmit.co`). Es un proveedor externo, no un backend propio de Fudgo.
- La dirección de destino y la lógica de envío quedan visibles en el JavaScript. Esto es normal en un formulario estático, pero no ofrece validación ni protección robusta del lado del servidor.
- La opción `_captcha: false` existente desactiva el CAPTCHA de FormSubmit. El campo trampa añadido es solo una mitigación básica y no reemplaza CAPTCHA, límites de frecuencia ni validación de servidor.
- Hay que confirmar que FormSubmit tenga activada/verificada la dirección `contact@fudgo.com` y probar el envío real desde el dominio publicado. No se puede confirmar la recepción real desde una revisión local.

**Recomendación:** para producción, usar un endpoint propio (por ejemplo, una función PHP en Hostinger) con validación del servidor, honeypot, limitación de frecuencia y protección CSRF/origen. No se debe confiar únicamente en validaciones JavaScript.

### Prioridad alta — documentos legales
Los textos de términos y privacidad son genéricos y hacen afirmaciones operativas concretas (por ejemplo, sobre comisiones, procesamiento de pedidos, datos recopilados, cookies, retención y jurisdicción). Deben compararse con el funcionamiento real de Fudgo y revisarse legalmente antes de publicar. La auditoría técnica no certifica su cumplimiento jurídico.

### Prioridad media — recursos y rendimiento
- Hay 30 SVG de iconos que en realidad contienen imágenes PNG codificadas en Base64 y suman aproximadamente 20 MB. No se encontraron referencias a esos iconos en las páginas HTML ni en el CSS revisados. Se conservaron para no eliminar recursos que pudieran utilizarse en otro flujo, pero conviene confirmar si son prescindibles y sustituirlos por imágenes optimizadas si se necesitan.
- Hay tres imágenes en `assets/public_lovable-uploads` que no están referenciadas desde las páginas o CSS revisados. Se conservaron.
- La tipografía se carga desde Google Fonts; si el proveedor externo no responde, se utilizará la fuente alternativa definida en CSS.
- Conviene convertir imágenes fotográficas pesadas a WebP/AVIF y dimensionarlas para cada espacio visual, después de comprobar su apariencia.

### Prioridad media — estructura
- `leads.html` ya no contiene un panel funcional de gestión; es una página informativa que indica que no existe autenticación ni conexión a base de datos. No debe confundirse con una ruta administrativa protegida.
- La sección de términos y privacidad se genera desde `translations.json`. Se preservó el mecanismo, pero debe verificarse visualmente el texto final en ambos idiomas.

## Verificaciones realizadas
- `app.js`: comprobación sintáctica con Node.js, sin errores.
- `translations.json`: JSON válido.
- Referencias `data-i18n` de las páginas: todas tienen clave correspondiente en el diccionario.
- Referencias locales de `href`/`src` en las páginas: no se detectaron archivos faltantes tras corregir el favicon.
- Llaves de CSS: balanceadas.

## Límites de esta entrega
No se ejecutó una prueba visual interactiva en navegadores reales ni una prueba de envío de correo contra FormSubmit/Hostinger. Antes de publicar, probar en Chrome, Firefox y Safari/Edge; revisar móvil/tablet; y enviar formularios reales de prueba. Tampoco se alteró el contenido comercial o legal para evitar cambiar afirmaciones de negocio sin validación.
