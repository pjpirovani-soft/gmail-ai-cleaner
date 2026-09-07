# 📘 Guía de Usuario - Gmail AI Cleaner v2.0

Bienvenido a la guía oficial de usuario de **Gmail AI Cleaner v2.0**. Esta guía está pensada para ayudarte a aprovechar al máximo todas las funciones de limpieza inteligente de tu cuenta de correo Gmail, manteniendo siempre el control sobre tus datos y evitando el borrado accidental de información importante.

---

## 📑 Tabla de Contenidos

1. [Primeros Pasos](#primeros-pasos)
2. [Filtros de Búsqueda y Sintaxis de Gmail](#filtros-de-búsqueda-y-sintaxis-de-gmail)
3. [Chips de Filtro Rápido](#chips-de-filtro-rápido)
4. [Análisis con Inteligencia Artificial (Gemini)](#análisis-con-inteligencia-artificial-gemini)
5. [Criterios de Clasificación](#criterios-de-clasificación)
6. [Tabla Interactiva y Ajustes Manuales](#tabla-interactiva-y-ajustes-manuales)
7. [Modos de Limpieza](#modos-de-limpieza)
8. [Acciones por Lote](#acciones-por-lote)
9. [Mejores Prácticas para Alcanzar "Inbox Zero"](#mejores-prácticas-para-alcanzar-inbox-zero)
10. [Preguntas Frecuentes (FAQ)](#preguntas-frecuentes-faq)

---

## 1. Primeros Pasos

Al acceder a la aplicación en `http://localhost:3000` (o en la URL provista por tu entorno en la nube), serás recibido por el panel principal diseñado con la guía de estilo **Google Material Design 3**:

- **Barra Superior (App Bar)**: Identifica la aplicación, muestra la versión activa y te permite gestionar tu sesión y consultar el estado de conexión con Gmail desde el avatar de usuario.
- **Tarjeta de Bienvenida**: Contiene información sobre el modo seguro y atajos rápidos a los filtros más comunes.
- **Formulario de Búsqueda**: Permite definir la consulta en lenguaje nativo de Gmail y el número máximo de correos a recuperar y analizar en cada tanda (por defecto 10, máximo 100).

---

## 2. Filtros de Búsqueda y Sintaxis de Gmail

Gmail AI Cleaner soporta toda la potencia de la sintaxis nativa del motor de búsqueda de Gmail. A continuación se detallan los operadores más útiles:

| Operador | Ejemplo | Descripción |
| :--- | :--- | :--- |
| `older_than:[tiempo]` | `older_than:1y` | Mensajes con más de 1 año de antigüedad (`d` para días, `m` para meses, `y` para años). |
| `newer_than:[tiempo]` | `newer_than:6m` | Mensajes recibidos en los últimos 6 meses. |
| `from:[remitente]` | `from:newsletter` | Filtra por el remitente o dominio de procedencia. |
| `larger:[tamaño]` | `larger:10M` | Mensajes con adjuntos que superen el tamaño indicado (ideal para liberar almacenamiento en Google Drive/One). |
| `has:attachment` | `has:attachment filename:pdf` | Mensajes que contienen archivos adjuntos o extensiones específicas. |
| `is:unread` | `is:unread older_than:30d` | Correos marcados como no leídos con más de 30 días en la bandeja. |
| `category:[categoría]` | `category:promotions` | Filtra correos de la pestaña Promociones de Gmail. |
| `label:[etiqueta]` | `label:social` | Filtra correos etiquetados como notificaciones de redes sociales. |

> 💡 **Consejo Pro**: Puedes combinar operadores con espacios o el operador lógico `OR`. Por ejemplo:
> `category:promotions older_than:6m` o `(from:ofertas OR from:newsletter) older_than:1y`.

---

## 3. Chips de Filtro Rápido

Para ahorrar tiempo, la aplicación incluye cuatro botones de chip accesibles con un solo clic:

1. **📅 Correos antiguos (`older_than:1y`)**: Identifica correos con más de doce meses en tu buzón.
2. **📰 Newsletters (`from:newsletter`)**: Detecta suscripciones a boletines informativos.
3. **📎 Correos pesados (`larger:10M`)**: Encuentra los mensajes que más espacio ocupan en tu cuenta de Google.
4. **🏷️ Promociones caducadas (`from:ofertas`)**: Agrupa avisos comerciales de tiendas y promociones vencidas.

---

## 4. Análisis con Inteligencia Artificial (Gemini)

Cuando presionas el botón **Analizar**:

1. Se activa la **Barra de Progreso Lineal de Material**, mostrando el avance en tiempo real (`Analizando correo X de Y con Gemini...`).
2. El servidor envía los metadatos relevantes (asunto, remitente y resumen del cuerpo) al modelo de IA **Gemini 2.5 Flash**.
3. El modelo analiza el tono, la temporalidad y el valor del mensaje.
4. En milisegundos se despliega el **Panel de Métricas** con 3 tarjetas visuales (Rojo, Amarillo y Verde) y la tabla con los resultados clasificados.

---

## 5. Criterios de Clasificación

| Recomendación | Color Material | Criterio de Decisión de la IA |
| :--- | :--- | :--- |
| **🗑️ Eliminar** | Rojo (`#EA4335`) | Correos promocionales vencidos, publicidad invasiva, notificaciones automáticas caducadas o spam. |
| **📁 Archivar** | Amarillo / Ámbar (`#FBBC04`) | Facturas contables, recibos de servicios, confirmaciones de compras/reservas y boletines ya leídos con valor como registro histórico pero que no deben ensuciar la bandeja activa. |
| **✅ Conservar** | Verde (`#34A853`) | Comunicaciones laborales vigentes, correos personales, alertas de seguridad de cuentas y documentos legales pendientes de respuesta. |

---

## 6. Tabla Interactiva y Ajustes Manuales

La tabla de datos de Material Design te da control total sobre las recomendaciones sugeridas:

- **Casilla de Selección Global**: La casilla en el encabezado selecciona o deselecciona todos los correos visibles en la página actual.
- **Casillas Individuales**: Selecciona correos específicos para aplicar acciones rápidas.
- **Menú de Acción por Fila**: ¿La IA clasificó un correo como "Archivar" pero prefieres "Eliminar"? Usa el selector desplegable en la columna *Acción* para cambiar la decisión al instante. Las métricas del resumen superior se actualizarán automáticamente.
- **Paginación Material**: Usa los controles inferiores para cambiar de página o ajustar las filas mostradas (5, 10 o 25 por página).

---

## 7. Modos de Limpieza

Una vez revisada la lista, puedes elegir entre tres modos de ejecución según tu nivel de confianza:

### 1. 🔍 Modo Simulación
- **¿Qué hace?** Ejecuta una prueba virtual completa sin realizar ningún cambio real en tu cuenta de Gmail.
- **¿Cuándo usarlo?** Cuando estés probando un nuevo filtro o desees auditar las decisiones antes de confirmarlas.

### 2. 🚀 Modo Ejecución Automática
- **¿Qué hace?** Aplica las acciones recomendadas (eliminar, archivar o conservar) de una sola vez para todos los correos de la lista.
- **¿Cuándo usarlo?** Cuando confíes plenamente en la clasificación y quieras limpiar rápidamente lotes de cientos de correos.

### 3. 🔄 Modo Interactivo
- **¿Qué hace?** Registra una revisión asistida donde cada correo es validado de acuerdo a los cambios definidos por el usuario en la tabla.
- **¿Cuándo usarlo?** Para limpiezas quirúrgicas de correos laborales o personales de alto impacto.

---

## 8. Acciones por Lote

Si solo quieres actuar sobre un subconjunto de correos:

1. Marca las casillas de los correos deseados.
2. Observa el indicador superior `(X seleccionados)`.
3. Haz clic en:
   - **🗑️ Eliminar seleccionados**: Mueve los elementos seleccionados a la papelera.
   - **📁 Archivar seleccionados**: Archiva los elementos seleccionados fuera de Recibidos.
4. Una notificación **Snackbar** en la esquina inferior izquierda confirmará la operación.

---

## 9. Mejores Prácticas para Alcanzar "Inbox Zero"

1. **Empieza por el tamaño**: Usa `larger:10M` para liberar rápidamente gigabytes de espacio en tu cuenta de Google.
2. **Ataca las promociones del año pasado**: El filtro `category:promotions older_than:1y` suele ser 100% seguro para eliminación masiva.
3. **Revisa las newsletters viejas**: Filtra con `from:newsletter older_than:6m` y opta por archivar o eliminar.
4. **Haz una simulación primero**: Nunca ejecutes borrados masivos de filtros nuevos sin correr antes una simulación.

---

## 10. Preguntas Frecuentes (FAQ)

### ¿Se pueden recuperar los correos eliminados?
Sí. En Gmail, los correos eliminados van a la carpeta **Papelera** (Trash), donde permanecen por 30 días antes de su eliminación definitiva por parte de Google.

### ¿Qué pasa si no tengo configurada una API Key de Gemini?
La aplicación incluye un motor heurístico de clasificación inteligente que evalúa palabras clave, tipos de remitente y patrones comunes de spam y newsletters, permitiendo que la app funcione al 100% de manera local y sin costos.

### ¿Se comparten mis correos con terceros?
No. La aplicación procesa los datos únicamente entre tu navegador y tu servidor local/privado. Si utilizas la API de Gemini, solo se transmiten los metadatos necesarios para la clasificación mediante canales seguros y cifrados (HTTPS).
