# NovaMed · Caso de Problem Solving

Kit completo para correr un **experimento causal de dos brazos** disfrazado de caso de problem solving. Los participantes no saben que están en un experimento — ven solo el caso, sus sobres y la herramienta del árbol. El facilitador ve toda la infraestructura experimental (diseño, asignación, rúbrica, análisis) en un modo separado.

Mismo caso base, mismo LLM, mismo tiempo. Lo único que cambia entre brazos es el **tipo de evidencia** que reciben en sus sobres: tablas y métricas (cuanti) vs. citas y entrevistas (cuali).

Estética editorial sobria, paleta violeta sobre papel, sobres cerrados que se abren al click, árbol jerárquico con conexiones SVG.

---

## Modos del sitio (importante)

El sitio tiene dos modos:

| Modo | Cómo se accede | Qué ve |
|---|---|---|
| **Participante** (default) | Cualquier URL sin parámetros | Solo: Caso · Sobres · Árbol. No menciona "experimento", "cuanti vs cuali", "hipótesis" ni "rúbrica". Su brazo asignado se presenta como "tu material" sin etiqueta técnica. |
| **Facilitador** | `?modo=facilitador` o atajo `Ctrl+Shift+F` | Todo el sitio: Diseño del experimento · Asignación · Caso · Sobres (ambos brazos) · Árbol · Evaluación con rúbrica y análisis estadístico. |

**Para correr el experimento en limpio:**
1. El facilitador prepara la asignación en `?modo=facilitador`.
2. A cada equipo le pasa el link **sin parámetros**, con el brazo preseteado (el facilitador edita `localStorage` o usa `?brazo=A`/`?brazo=B` — ver Notas técnicas).
3. Los participantes nunca ven la palabra "experimento".

---

## Estructura del repo

```
.
├── index.html      ← Estructura (849 líneas)
├── styles.css      ← Diseño editorial (1046 líneas)
├── app.js          ← Lógica (379 líneas)
├── README.md       ← Este archivo
└── .nojekyll       ← Para que GitHub Pages no procese con Jekyll
```

---

## ¿Qué contiene el sitio?

Seis secciones, navegables por pestañas:

| # | Sección | Qué tiene |
|---|---|---|
| 01 | **Diseño** | Hipótesis, brazos, variables, controles, amenazas y mitigaciones |
| 02 | **Asignación** | Botón de randomización + protocolo para corrida real |
| 03 | **Caso** | El caso NovaMed (idéntico para los dos brazos) |
| 04 | **Sobres** | Tres sobres por brazo. Se muestran solo los del brazo asignado |
| 05 | **Árbol** | Constructor interactivo del árbol de problema |
| 06 | **Evaluación** | Rúbrica, registro y plan de análisis estadístico |

---

## Hipótesis

> El énfasis en datos **cuantitativos** producirá árboles con mejor estructura de causa raíz vs. síntoma. El énfasis en información **cualitativa** producirá recomendaciones más claras y accionables para el decisor. Ambos enfoques son útiles, pero para dimensiones distintas del problema.

Predicción cruzada (no "uno gana en todo"), más informativa que una hipótesis simple porque te dice cómo combinar los enfoques en el training final.

---

## Brazos

| | Brazo A · Cuanti | Brazo B · Cuali |
|---|---|---|
| Sobre 1 | Tablas de métricas, tickets, ratios | Entrevistas a IT y Operaciones, citas literales |
| Sobre 2 | Distribución estadística de turnos, costos | Voces del piso (médicos, enfermeros, admisión) |
| Sobre 3 | Tabla del contrato y el dato del Anexo C | Entrevista a la abogada sobre el contrato |

**Los hechos son idénticos en ambos brazos.** Lo que cambia es la forma en que están presentados. Es la única manipulación experimental.

---

## Variables medidas

- **Y1 · Estructura del árbol** (rúbrica 1–3): ¿llega a causa raíz?
- **Y2 · Gestión de información** (rúbrica 1–3): ¿cuándo cerró el diagnóstico? ¿pidió Sobre 3 con justificación?
- **Y3 · Claridad al decisor** (rúbrica 1–3): ¿el CFO entiende qué hacer leyéndolo en 30 segundos?

Y2 requiere registro en vivo durante la sesión. Y1 e Y3 se evalúan después, **ciego al brazo**.

---

## Cómo hostear en GitHub Pages

1. Creá un repo nuevo en GitHub.
2. Subí los 5 archivos al root del repo.
3. En el repo, andá a **Settings → Pages**.
4. En "Build and deployment", source = `Deploy from a branch`, branch = `main`, folder = `/ (root)`.
5. Guardá. En 1-2 minutos, el sitio va a estar en `https://<tu-usuario>.github.io/<nombre-del-repo>/`.

Sin build, sin dependencias, sin backend. El estado se guarda en `localStorage`.

---

## Cómo correr el experimento

### Antes de la sesión

1. Listar a todos los participantes con `seniority × área`.
2. Asignar al azar dentro de cada estrato: mitad a A, mitad a B.
3. Formar equipos de 3–4 personas **dentro del mismo brazo** (no mezclar).
4. Preparar dos salas separadas.
5. Documentar la asignación en una tabla (`equipo_id, brazo, participantes, facilitador`).

### Durante la sesión (45 min)

| Tiempo | Qué pasa |
|---|---|
| 0–5 min | Brief inicial + presentación del caso. Cada equipo **abre el Sobre 1** (click sobre el sobre cerrado) |
| 5–25 min | Trabajo en modo libre. El equipo decide cuándo **abrir el Sobre 2**. Puede pedir el Sobre 3 (cuesta 2 min) |
| 25–40 min | Construcción del árbol + redacción de las 3 recomendaciones |
| 40–45 min | **Usan los prompts sugeridos en la sección Árbol** para construir la presentación final al CFO con Claude. Exportar JSON y entregar |

**Sobres cerrados**: cada sobre aparece cerrado en pantalla. El equipo lo abre haciendo click cuando decide consultarlo. El sistema registra automáticamente el timestamp de cada apertura en `localStorage` bajo la key `novamed_sobre_log`. Esto le da al facilitador datos objetivos para Y2 (gestión de información).

**Uso del LLM**: todos los equipos usan **Claude** (claude.ai). Controla la variable "modelo de IA". En la sección Árbol hay **4 prompts sugeridos** que el equipo puede copiar al portapapeles para usar con Claude:
1. Pulir el árbol (Claude critica la estructura)
2. Afinar las recomendaciones (action + owner + plazo)
3. Producir la presentación de 1 página al CFO
4. Anticipar la objeción del CFO (Claude juega de Roberto Hein)

Registrar como variable secundaria: cuántas veces usaron Claude, en qué momento, y con qué prompts (custom o de los sugeridos). Sirve para descartar que un brazo haya usado el LLM mucho más que el otro.

### Después de la sesión

1. Recolectar todos los JSONs.
2. Anonimizarlos (quitar `brazo` antes de mandar a evaluadores).
3. Dos evaluadores independientes puntúan Y1 e Y3 con la rúbrica.
4. Calcular acuerdo entre evaluadores (Cohen's kappa ≥ 0.6).
5. Comparar brazos con Mann-Whitney U por outcome. Reportar mediana + IC 95% + effect size.
6. Evaluar la hipótesis cruzada: ¿A gana en Y1, B gana en Y3?

---

## Formato del JSON exportado

```json
{
  "meta": {
    "experimento": "NovaMed v1",
    "brazo": "A",
    "timestamp": "2026-06-01T18:00:00Z",
    "n_nodos": 7,
    "n_conexiones": 6
  },
  "columnas": ["Proceso", "Personas", "Tecnología", "Gobernanza"],
  "niveles": ["Efecto observado", "Problema central", "Causa raíz", "Causa subyacente"],
  "nodos": [
    {
      "id": "n_abc123",
      "texto": "El sistema no resuelve el problema operativo principal",
      "nivel": "efecto",
      "columna": "proceso",
      "explicado_por": ["n_def456"]
    }
  ],
  "recomendaciones": [
    { "plazo": "inmediato (esta semana)", "texto": "..." },
    { "plazo": "corto (2 semanas)", "texto": "..." },
    { "plazo": "estructural", "texto": "..." }
  ]
}
```

---

## Sobre la estética

- **Tipografía:** Fraunces (serif moderna con itálicas expresivas) para títulos, DM Sans para body, JetBrains Mono para datos y marcadores.
- **Paleta:** papel (#F4F1EA) + tinta (#1A1815) + acento violeta profundo (#5B2C8F). Los brazos tienen color secundario: violeta oscuro (#3D2B6F) para A, violeta-rosa (#8B3A8F) para B.
- **Marcadores numerados** tipo libro ("— 01", "— Paso 01") como separadores editoriales.
- **Itálicas en palabras clave** de los títulos como acento poético.
- **Cards minimal**, sin sombras, sin gradientes, sin dramatismo.

---

## Limitaciones

- N pequeño (15-20 equipos por brazo) detecta solo efectos medianos o grandes.
- Sin grupo "sin training": no se puede afirmar que el training en general funciona.
- Sin medición de seguimiento: no sabemos si el efecto se sostiene.
- Validez externa limitada: replicar con un caso distinto fortalecería la generalización.


---

## Notas técnicas

### Activar modo facilitador

- Por URL: `https://tu-sitio.github.io/?modo=facilitador`
- Por atajo: `Ctrl + Shift + F` (alterna entre modos)
- Se guarda en `localStorage`, así que no hace falta repetir cada vez

### Preasignar el brazo (para participantes)

El facilitador puede compartir links con el brazo ya asignado para que el participante no tenga que hacer la asignación aleatoria local. Si querés implementar esto, basta con leer `?brazo=A` o `?brazo=B` en el JS y llamar `setBrazo()` automáticamente. (No está implementado todavía en esta versión — los participantes hacen click en "Asignarme aleatoriamente" o el facilitador les indica su brazo verbalmente).

### El árbol de problema

Visualización jerárquica con SVG: nodos posicionados en 4 filas (Efecto / Problema central / Causa raíz / Causa subyacente) y conectados por curvas bezier. El layout se recalcula automáticamente al agregar/quitar nodos.

Cada nodo tiene:
- Texto del nodo
- Nivel (efecto/problema/causa1/causa2)
- Columna (proceso/personas/tecnología/gobernanza) — categoría temática
- Conexiones a causas del nivel inferior

### Sobres cerrados

Cada sobre aparece visualmente como un sobre cerrado (con pliegue triangular en la esquina). Al hacer click se abre con animación. El **timestamp de cada apertura se guarda en `localStorage`** bajo `novamed_sobre_log`, lo que da datos objetivos al facilitador para evaluar Y2 (gestión de información) sin depender de la observación manual.

### Prompts para Claude

En la sección Árbol hay 4 prompts copiables al portapapeles, para que los equipos los usen con Claude (claude.ai) en la fase final de construcción de la presentación al CFO. Esto controla la variable "modelo de IA" en el experimento — todos usan el mismo modelo.
