# Especificación del Proyecto — Smart Garden / Jardín Natural

**Versión**: 1.0  
**Fecha**: 2026-05-26  
**Estado**: Borrador aprobado  
**Alcance geográfico**: Galicia primero → España  

---

## Visión

Una aplicación para diseñar, explorar y documentar jardines y huertos. El eje central es la **exploración de la naturaleza a través de la información**: el usuario puede diseñar su espacio, investigar plantas, documentar lo que encuentra, aprender con guías prácticas y conectar con productores locales. No es una herramienta de productividad agrícola — es un cuaderno de campo digital con alma de comunidad.

---

## Estado actual (POC)

La POC existente implementa:
- Planificador de bancales con grid interactivo
- Catálogo de ~50 plantas gallegas
- Calendario de siembra/cosecha (clima atlántico)
- Diario del huerto
- Auth por Magic Link (Supabase) + sync localStorage↔Supabase

**Limitaciones a resolver antes de expandir (E0)**:

| # | Limitación | Impacto |
|---|---|---|
| L1 | Fotos en DiaryEntry no implementadas (`photos: string[]` siempre vacío) | Diario sin fotos |
| L2 | Mes actual hardcoded como ABR en Calendar | Bug de UX |
| L3 | Last-write-wins entre dispositivos (sin merge) | Pérdida de datos posible |
| L4 | Botón "+ plantar en un bancal" en PlantDetail sin handler | Dead UI |
| L5 | Sin paginación en Catalog e History | Rendimiento con catálogo grande |
| L6 | Sin quality gate automatizado (solo lint + tsc manual) | Regresiones invisibles |

---

## Épicas

### E0 — Fixes POC
Resolver las 6 limitaciones documentadas. Prerequisito para todo lo demás.

### E1 — Motor de Contenido
Infraestructura de datos que alimenta E2, E3, E4 y E6. Sin E1 no hay contenido que explorar.

### E2 — Diseñador de Jardín
Evolución del editor de bancales a diseñador de espacio completo.

### E3 — Herbolario
Base botánica pública + colección personal del usuario.

### E4 — Comunidad
Foro general de jardinería con subforos temáticos.

### E5 — Marketplace
Anuncios de productos de agricultores y comercios locales.

### E6 — Guías
Contenido editorial práctico (poda, diseño, cultivo).

---

## Épica E0 — Fixes POC

**Objetivo**: dejar la app base sin deuda técnica visible antes de crecer.

### Historias

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E0-1 | Como usuario quiero ver y añadir fotos en entradas del diario | Upload a Supabase Storage; miniatura en timeline; modal de previsualización |
| E0-2 | Como usuario el calendario debe mostrar el mes real como activo | `new Date().getMonth()` como mes inicial; indicador visual dinámico |
| E0-3 | Como usuario mis datos no se pierden si abro la app en dos pestañas | Estrategia de merge: Supabase como fuente de verdad si `updated_at` > localStorage |
| E0-4 | Como usuario puedo plantar directamente desde la ficha de una planta | El botón abre un modal para seleccionar bancal y celda |
| E0-5 | Como usuario el catálogo carga rápido aunque tenga 500+ plantas | Virtualización o paginación en Catalog e History |
| E0-6 | El proyecto tiene un CI básico que valida lint y tipos en cada PR | GitHub Action: `tsc -b && npm run lint` |

---

## Épica E1 — Motor de Contenido

**Objetivo**: construir la base de datos botánica pública y el pipeline de scraping que la alimenta de forma incremental y organizada.

### Arquitectura del pipeline

```
scraper/ (repo independiente o carpeta raíz)
  ├── sources/           # configuración de fuentes por dominio
  │     ├── plants.yaml
  │     ├── guides.yaml
  │     └── herbarium.yaml
  ├── runners/           # scripts por tipo de contenido
  │     ├── scrape_plants.py
  │     ├── scrape_guides.py
  │     └── scrape_herbarium.py
  ├── transformers/      # normalización al schema Supabase
  └── .github/workflows/
        └── scrape_cron.yml   # ejecución incremental (cron + manual trigger)

Supabase (tablas públicas, sin RLS o RLS read-public)
  plants_public
  guides
  herbarium_public
  scrape_log       # qué se procesó, cuándo, estado
```

**Principios del scraping**:
- **Incremental**: cada ejecución registra en `scrape_log` qué URLs procesó y su hash. Solo re-procesa si cambia el contenido.
- **Organizado por fuente**: cada fuente tiene su configuración (URL base, selectores CSS, campos a extraer, frecuencia de actualización).
- **Curación obligatoria**: los registros entran en estado `draft`. Un editor (o la propia app con panel admin) los aprueba antes de publicar.
- **Fuentes iniciales Galicia/España**: Flora Ibérica (CSIC), Asturnatura, Biodiversidad Virtual, Asociación Etnobotánica Galega, viveros especializados (Viveros Hnos. Fernández, etc.).

### Schema de datos públicos

**`plants_public`**
```
id, slug, name_es, name_gl, name_scientific, family
kind (PlantKind extendido: + tree, shrub, fungus, fern, aquatic...)
description, uses_medicinal, uses_culinary, uses_ornamental
sun, water, difficulty, climate_zone[]
sow[], plant[], harvest[]          # meses (0-11)
companions[], avoid[]              # slugs
native_regions[]                   # ['galicia', 'cantabrico', ...]
images[]                           # URLs Supabase Storage
source_url, source_name
status ('draft' | 'published')
```

**`guides`**
```
id, slug, title, subtitle
category ('poda' | 'diseño' | 'bancales' | 'plagas' | 'riego' | 'compost' | 'setos' | ...)
plant_ids[]                        # plantas relacionadas
content_md                         # Markdown
difficulty (1|2|3)
season[]                           # meses relevantes
images[]
source_url, source_name
status ('draft' | 'published')
```

**`herbarium_public`**
```
id, slug, name_es, name_gl, name_scientific, family
type ('plant' | 'tree' | 'shrub' | 'fungus' | 'fern' | 'moss' | 'aquatic')
description, habitat, medicinal_properties, toxicity_warnings
distribution_galicia               # texto
images[]
source_url
status ('draft' | 'published')
```

**`scrape_log`**
```
id, source_name, url, content_hash
scraped_at, status ('ok' | 'error' | 'skipped')
records_created, records_updated
error_message
```

### Historias

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E1-1 | El pipeline puede scrapearse manualmente con un comando | `python runners/scrape_plants.py --source flora-iberica --limit 50` funciona |
| E1-2 | El pipeline corre en cron semanal (GitHub Actions) | Workflow `.github/workflows/scrape_cron.yml` activo y con logs |
| E1-3 | Registros scrapeados esperan aprobación antes de publicarse | Estado `draft` por defecto; endpoint/panel para aprobar |
| E1-4 | La app muestra el catálogo público de plantas | Nueva pantalla o integración en Catalog existente |
| E1-5 | La app muestra guías navegables por categoría | Pantalla Guías con filtro por categoría y búsqueda |
| E1-6 | El catálogo público tiene 200+ plantas gallegas publicadas | Requisito de contenido para lanzamiento de E1 |

---

## Épica E2 — Diseñador de Jardín

**Objetivo**: evolucionar el editor de bancales a un diseñador de espacio completo donde el usuario puede representar todo su jardín o finca.

### Elementos del diseñador

| Tipo | Descripción | Propiedades |
|---|---|---|
| **Bancal** | Grid de celdas plantables (actual) | W×H, color, nombre, plantas |
| **Árbol / arbusto** | Elemento circular con radio de copa | Especie, radio copa (m), radio sombra (m) |
| **Camino** | Polilínea configurable | Ancho (m), material (tierra/grava/losa/hierba) |
| **Vallado / seto** | Línea con altura | Tipo (madera/metal/seto vivo), altura (m), especie (si seto) |
| **Zona** | Polígono relleno | Tipo (césped/tierra/grava/pavimento/agua), textura |
| **Agua** | Forma libre | Tipo (estanque/acequia/depósito), capacidad |
| **Edificación** | Rectángulo | Tipo (cobertizo/invernadero/caseta/compostera), dimensiones |
| **Anotación** | Post-it sobre el lienzo | Texto libre, color |

### Modelo de datos

**`gardens`** (nuevo, reemplaza/extiende `beds` para diseñador completo)
```
id, user_id, name
canvas_w, canvas_h          # metros
elements: GardenElement[]   # JSONB — todos los elementos del diseño
thumbnail_url
created_at, updated_at
```

**`GardenElement`** (JSONB discriminated union)
```ts
type GardenElement =
  | { type: 'bed';      id; x; y; w; h; colorIdx; cells; name }
  | { type: 'tree';     id; x; y; species_id; crown_r; shadow_r; name }
  | { type: 'path';     id; points[]; width; material }
  | { type: 'fence';    id; points[]; height; kind }
  | { type: 'zone';     id; points[]; zone_type; texture }
  | { type: 'water';    id; points[]; water_type; capacity }
  | { type: 'building'; id; x; y; w; h; building_type; name }
  | { type: 'note';     id; x; y; text; color; rotate }
```

### Historias

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E2-1 | Puedo crear un jardín con nombre y dimensiones (m) | Modal de creación; dimensiones en metros; preview proporcional |
| E2-2 | Puedo colocar y mover bancales en el lienzo | Drag & drop; snap a grid 0.5m; edición inline igual que ahora |
| E2-3 | Puedo añadir árboles con radio de copa visible | Círculo con borde discontinuo para copa; radio de sombra como área semitransparente |
| E2-4 | Puedo trazar caminos y vallados | Click-to-add-point; doble click para cerrar; edición de puntos |
| E2-5 | Puedo añadir zonas rellenas (césped, agua, pavimento) | Polígono relleno con textura visual; label del tipo |
| E2-6 | Puedo añadir edificaciones (cobertizo, compostera...) | Rectángulo con icono y nombre |
| E2-7 | Puedo añadir notas post-it en cualquier punto del lienzo | Post-it arrastrable; edición de texto inline |
| E2-8 | El diseño se guarda y sincroniza como el resto de datos | Persistencia en localStorage + Supabase `gardens` |
| E2-9 | Puedo exportar el diseño como imagen PNG | `html2canvas` o SVG export |

---

## Épica E3 — Herbolario

**Objetivo**: base botánica pública de consulta + colección personal del usuario.

### Dos capas

**Pública** (`herbarium_public`, scrapeada en E1): catálogo de referencia de plantas, árboles, hongos y helechos. Solo lectura para usuarios.

**Personal** (`herbarium_personal`): el usuario colecciona especímenes que ha encontrado o cultivado, enlazados (opcionalmente) a la base pública.

```
herbarium_personal
  id, user_id
  public_ref_id (FK herbarium_public, nullable)
  name_custom             # si no hay referencia pública
  found_date, found_location
  notes
  images[]                # Supabase Storage
  tags[]
```

### Historias

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E3-1 | Puedo explorar el catálogo botánico público con búsqueda y filtros | Pantalla Herbolario; filtro por tipo, hábitat, propiedades medicinales |
| E3-2 | Cada entrada pública tiene ficha detallada | Nombre científico, descripción, hábitat, propiedades, distribución en Galicia, fotos |
| E3-3 | Puedo añadir un espécimen a mi colección personal | Botón en ficha pública o entrada manual; foto + fecha + lugar + notas |
| E3-4 | Mi colección personal es privada y sincronizada | Datos en Supabase bajo RLS `user_id`; mismo modelo offline/online que el resto |
| E3-5 | Puedo ver mi colección como galería y como lista | Dos vistas; ordenable por fecha, nombre, tipo |

---

## Épica E4 — Comunidad

**Objetivo**: foro general de jardinería con subforos temáticos. UGC moderado.

### Estructura del foro

```
Subforos:
  🌱 Identificación     — ¿qué planta es esta?
  🐛 Plagas y enfermedades
  🌿 Consejos y técnicas
  🛒 Semillas e intercambio
  💬 General
```

### Schema

```
forum_posts
  id, user_id, subforum, title, body_md
  images[]
  created_at, updated_at
  status ('active' | 'locked' | 'removed')
  pinned

forum_replies
  id, post_id, user_id, body_md
  images[]
  created_at
  status

forum_votes
  id, target_type ('post'|'reply'), target_id, user_id, value (1|-1)
```

### Historias

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E4-1 | Puedo ver los subforos y sus posts recientes | Pantalla Comunidad; lista de posts por subforo; indicador de actividad |
| E4-2 | Puedo crear un post con texto e imágenes | Editor Markdown básico + upload de hasta 4 fotos |
| E4-3 | Puedo responder a un post | Formulario de respuesta al pie del hilo |
| E4-4 | Puedo votar posts y respuestas | +1/-1; puntuación visible; un voto por usuario |
| E4-5 | Los posts de identificación pueden linkarse a una planta del herbolario | Campo opcional "planta identificada" que enlaza a `herbarium_public` |
| E4-6 | Existe moderación básica | Reportar post/reply; soft-delete (status='removed'); sin panel de admin por ahora |

---

## Épica E5 — Marketplace

**Objetivo**: agricultores y comercios locales publican anuncios de productos individuales (modelo Wallapop).

### Schema

```
marketplace_listings
  id, user_id
  title, description
  category ('semillas' | 'plantones' | 'herramientas' | 'abonos' | 'productos' | 'servicios' | 'otro')
  price, price_unit ('kg'|'ud'|'lote'|'servicio'|'negociable')
  location_text, location_province
  images[]
  contact_info              # texto libre: teléfono, email, Instagram...
  available                 # boolean
  created_at, expires_at
  status ('active' | 'sold' | 'removed')
```

### Historias

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E5-1 | Puedo explorar anuncios con filtro por categoría y provincia | Pantalla Marketplace; grid de anuncios; filtros |
| E5-2 | Puedo publicar un anuncio con fotos y precio | Formulario completo; hasta 6 fotos; validación de campos obligatorios |
| E5-3 | Puedo ver el detalle de un anuncio con info de contacto | Página de detalle; botón "contactar" que muestra la info |
| E5-4 | Puedo marcar mi anuncio como vendido o eliminarlo | Gestión desde mi perfil |
| E5-5 | Los anuncios caducan automáticamente a los 60 días | `expires_at = created_at + 60d`; se ocultan al caducar; email de recordatorio |

---

## Épica E6 — Guías

**Objetivo**: contenido editorial práctico vinculado al catálogo de plantas y al diseñador.

### Categorías de guías

- **Poda**: manzano, peral, laurel, vid, rosales...
- **Diseño**: cómo hacer un seto, bancales en pendiente, jardín de lluvia...
- **Cultivo**: guías por planta (tomate paso a paso, patata en Galicia...)
- **Plagas**: identificación y tratamiento ecológico
- **Compost y suelo**: compostaje en apartamento, enmiendas...
- **Calendario de trabajos**: qué hacer cada mes en Galicia

### Historias

| ID | Historia | Criterio de aceptación |
|---|---|---|
| E6-1 | Puedo explorar guías por categoría y buscar por título | Pantalla Guías; cards con imagen, título, dificultad, tiempo estimado |
| E6-2 | Puedo leer una guía con formato rico (pasos, imágenes, tips) | Renderizado Markdown; pasos numerados; notas destacadas |
| E6-3 | Las guías están enlazadas a plantas del catálogo | "Plantas relacionadas" en cada guía con link a ficha |
| E6-4 | Las guías aparecen como sugerencia contextual en el diseñador | Si el usuario coloca un manzano, aparece sugerencia "Guía de poda de manzano" |
| E6-5 | Existen al menos 20 guías publicadas en el lanzamiento de E6 | Requisito de contenido mínimo |

---

## Fases de entrega

### Fase 1 — POC sólida (E0)
**Meta**: ningún bug visible, base técnica lista para crecer.  
**Épicas**: E0 completa.  
**Duración estimada**: sprint corto (1-2 semanas).

### Fase 2 — Contenido masivo (E1 + E3 parcial + E6 parcial)
**Meta**: la app tiene valor de consulta independientemente del planificador. Tráfico orgánico por SEO de contenido.  
**Épicas**: E1 completa, E3-1/E3-2 (herbolario público), E6-1/E6-2/E6-3 (guías navegables).  
**Requisitos de contenido**: 200+ plantas públicas, 20+ guías, 100+ entradas herbolario.  
**Infraestructura nueva**: repo de scraping, schema Supabase ampliado, panel editorial básico.

### Fase 3 — Diseñador + Comunidad (E2 + E3 completa + E4 + E5)
**Meta**: la app es una plataforma completa. El usuario diseña, aprende, documenta, comparte y compra/vende.  
**Épicas**: E2 completa, E3 completa, E4 completa, E5 completa.  
**Prerequisito**: Fase 2 lanzada con masa de contenido suficiente para atraer usuarios a la comunidad.

---

## Decisiones técnicas tomadas

| Decisión | Valor | Razón |
|---|---|---|
| Auth | Magic Link (passwordless) | Ya implementado, sin fricciones |
| Hosting | Netlify (CDN estático) | Ya configurado |
| DB | Supabase PostgreSQL | Ya implementado; escala para E1-E6 |
| Storage | Supabase Storage | Para fotos de diario, herbolario, marketplace |
| Scraping | Pipeline externo (GitHub Actions) | Separación de concerns; sin límites de tiempo |
| Monetización | No definida | No bloquear arquitectura |
| Drawing tool | Grid evolucionado + formas libres | Coherente con POC existente |
| Geolocalización | Texto libre + provincia | Sin mapas externos por ahora |
| IA de identificación | Fuera de scope (fase 3+) | Coste y complejidad no justificados en fases 1-3 |

---

## Fuera de scope (explícito)

- SSR / SEO técnico (Fase 2+ puede requerir revisitar con Astro o Next)
- Notificaciones push
- App nativa (iOS/Android)
- Pagos en app (marketplace sin carrito)
- IA de identificación de plantas por foto
- Mapa satelital / georeferenciación
- Dark mode
