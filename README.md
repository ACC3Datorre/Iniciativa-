# NovaMed · Trabajo bajo presión

Caso de problem solving para entrenar las **4 soft skills que la IA no reemplaza**: trabajo en equipo, manejo del tiempo, actuar bajo presión y mirada interdisciplinaria. 45 minutos, 5 sobres, cronómetro corriendo.

> *La IA resuelve problemas individuales. Lo que pierde la gente con la IA es el músculo de trabajar con otros bajo presión. Este caso busca recuperarlo.*

---

## La mecánica

**45 minutos, dos equipos en paralelo, mismo caso, misma información disponible.** Lo que los diferencia es la **estrategia**: qué información priorizar cuando el tiempo cuesta.

**6 sobres, 6 colores, 6 temáticas:**

| # | Sobre | Útil | Costo |
|---|---|---|---|
| 1 | 🟣 **Brief inicial** — el caso y las dos versiones enfrentadas | ✅ | gratis |
| 2 | 🟢 **Datos del sistema** — métricas, 60% urgencias, tickets | ✅ | −2:30 |
| 3 | 🟠 **Voces del piso** — médicos, enfermeros, coordinadores | ✅ | −2:30 |
| 4 | 🟡 **Economía y contrato** — Anexo C + entrevista a abogada | ✅ | −2:30 |
| 5 | 🟪 **Entrevista en vivo al CFO** — un compañero actúa, 5 min | ✅ pero requiere buenas preguntas | −2:30 |
| 6 | 🔵 **Reporte del sector** — benchmarks macro de la industria | ❌ **trampa** | −2:30 |

Si abren los 5 sobres pagos: gastan **12:30 minutos** del cronómetro y les quedan 32:30 para trabajar. Si se quedan con el primero solo, tienen los 45 completos pero información incompleta. **No hay respuesta correcta a qué sobres abrir** — eso es exactamente lo que se entrena.

### Dos sobres especiales

**El sobre trampa (Sobre 6)**: contiene datos reales pero macro del sector salud que NO ayudan a diagnosticar el problema específico de NovaMed. Castiga a los equipos que abren todo por inercia. Aprendizaje: *no toda la información disponible vale lo mismo. Discriminar antes de pedir información es una habilidad concreta que la IA debilita.*

**La entrevista en vivo (Sobre 5)**: en lugar de información escrita, un compañero del equipo **actúa de Roberto Hein, el CFO**. El resto del equipo lo entrevista durante 5 minutos. El actor recibe un guion impreso del facilitador con contexto del personaje y respuestas a preguntas posibles. Las **buenas preguntas destraban información secreta** que no está en ningún otro sobre (preocupaciones políticas, qué le haría firmar tranquilo, qué piensa del proveedor). Las preguntas vagas obtienen respuestas vagas. Entrena el músculo de **hacer preguntas a humanos** — el opuesto al prompting.

---

## Las 4 soft skills

| Skill | Cómo se entrena |
|---|---|
| **Trabajo en equipo** | Decidir juntos qué sobres abrir, integrar perspectivas |
| **Manejo del tiempo** | Cronómetro visible, costo explícito por sobre, priorización forzada |
| **Actuar bajo presión** | Tiempo escaso, información incompleta, decisión obligatoria al final |
| **Interdisciplinario** | Cada sobre es una lente distinta. Integrar requiere salir del área de comodidad |

---

## Cómo se ve el sitio

### Para el participante

- Caso → Sobres → Árbol. Tres pestañas, nada más.
- Identificación automática: *"Sos del Equipo 1"* o *"Sos del Equipo 2"*
- Cronómetro grande arriba con cuenta regresiva
- Las 4 soft skills aparecen como compromiso del training

### Para el facilitador

- Misma cosa **más** la sección *Notas* con:
  - **Guion confidencial del CFO** para entregar al actor cuando se abre el Sobre 5 (botón *Imprimir guion*)
  - Qué observar en vivo (indicadores positivos / alertas por skill)
  - Datos automáticos que captura el sitio
  - Rúbrica de 4 dimensiones para evaluar entregables
  - Nota sobre el sobre trampa y cómo discutirlo en la retro
  - Preguntas para la retro
- Botones extra en el cronómetro: `+5 min`, `Reset`

**Activar modo facilitador:** URL `?modo=facilitador` o atajo `Ctrl + Shift + F`.

---

## Cronómetro y penalizaciones

- **45:00** al iniciar
- **Sobre 1 abre el cronómetro y es gratis**
- **Sobres 2–5 descuentan 2:30 min al abrir** — animación visual del descuento
- A los 5 min restantes: barra pulsa en violeta
- A los 0: barra roja, overlay aparece, sobres y árbol bloqueados
- Persiste en `localStorage`

---

## Datos automáticos en localStorage

| Key | Qué contiene |
|---|---|
| `novamed_timer_v1` | Timestamp de inicio + segundos de penalización |
| `novamed_sobre_log` | Array de aperturas: qué sobre, cuándo, qué equipo, qué costo |
| `novamed_experiment_v1` | Equipo asignado, árbol, recomendaciones |
| `novamed_team_counter` | Counter de asignación entre equipos |

Datos objetivos para el facilitador, complementan la observación en vivo.

---

## Estructura del repo

```
.
├── index.html      ← Estructura
├── styles.css      ← Diseño editorial violeta
├── app.js          ← Lógica: cronómetro, sobres, árbol, equipos
├── README.md       ← Este archivo
└── .nojekyll       ← Para GitHub Pages
```

---

## Hosting en GitHub Pages

1. Repo nuevo en GitHub
2. Subir los 5 archivos al root
3. Settings → Pages → `Deploy from a branch` → `main` / `/ (root)`
4. `https://<tu-usuario>.github.io/<nombre-repo>/`

Sin build, sin dependencias, sin backend.

---

## Cómo correr la sesión

### Antes

1. Compartir el link del sitio con los participantes
2. Dos equipos juntos físicamente en una sala
3. Tener `?modo=facilitador` abierto en tu propia máquina

### Durante (45 min)

1. **Min 0:** brief verbal. Cada equipo abre su Sobre 1. El cronómetro arranca con esa apertura.
2. **Min 0–40:** trabajo en equipo. Deciden qué sobres abrir según el costo. Construyen el árbol. Usan Claude con los prompts sugeridos.
3. **Min 40–45:** entregable final. Cada equipo exporta su JSON y muestra su presentación al CFO.

### Después

- 15 min de retro con las preguntas guía de la sección *Notas*
- Comparar entregables de los dos equipos
- Cruzar observación con datos del `localStorage`

---

## Decisiones de diseño

- **Asignación silenciosa de equipo**: saca discusiones improductivas sobre la división
- **Mismo contenido para ambos equipos**: lo que importa es la estrategia
- **Sobres con costo real**: el cronómetro hace literal lo que antes era metafórico
- **Estética editorial sobria**: no hay gamification exagerada. La presión viene del cronómetro y la información

---

## Historial

Versiones anteriores tenían un experimento causal cuanti vs cuali. **Esa parte fue descartada.** El training de soft skills es ahora el core. Si querés reincorporar medición experimental, los datos del `localStorage` te dan una base.
