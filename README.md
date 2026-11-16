# Resistencia — calculadora por código de colores

Aplicación web estática en español para calcular resistencias de 4, 5 y 6 bandas. No necesita backend, base de datos, cuenta ni instalación: la lógica corre en el navegador. La carpeta se puede publicar directamente en cualquier servicio de alojamiento estático con HTTPS.

## Incluye

- Cálculo directo con vista previa interactiva, tolerancia y rango mínimo/máximo.
- Cálculo inverso para encontrar bandas equivalentes a partir de un valor y tolerancia.
- Tabla de colores, multiplicadores y tolerancias.
- Historial de hasta cinco valores durante la sesión, con control para desactivarlo y borrarlo.
- Interfaz adaptable, navegación por teclado, etiquetas accesibles y anuncios de resultados.
- Validación de bandas, valores y tolerancias.

## Probar localmente

Abre `index.html` en un navegador moderno. Para ejecutar las pruebas de cálculo se requiere Node.js:

```sh
node tests/calculator.test.js
```

## Publicar y configurar URL/dominio

1. Sube el contenido de esta carpeta a un repositorio Git o directamente a un proveedor de sitios estáticos, como GitHub Pages, Cloudflare Pages o Netlify.
2. Configura la carpeta de publicación como la raíz (`/`) del proyecto. No se requiere comando de compilación ni directorio de salida separado.
3. El proveedor asignará una URL pública HTTPS que podrás abrir desde cualquier red.
4. Para usar un dominio propio, añade el dominio en la sección de dominios personalizados del proveedor y configura los registros DNS que este indique. La dirección final depende del proveedor y del dominio que elijas.

No hay una dirección pública configurada en este paquete; para obtenerla hay que publicarlo en una cuenta de alojamiento y, si se desea, apuntar un dominio propio. La fuente Manrope/DM Sans se carga desde Google Fonts; si no está disponible, se usan fuentes de sistema. Los cálculos no envían datos a ningún servidor.

## Notas de cálculo

La banda 6 se muestra como coeficiente térmico en ppm/°C (por ejemplo, rojo = 50 ppm/°C); la conversión inversa usa café (100 ppm/°C) como valor predeterminado. Consulta la ficha de la resistencia si necesitas confirmar una especificación del fabricante. El cálculo inverso propone una combinación representable con el número de bandas elegido y la tolerancia exacta seleccionada.
