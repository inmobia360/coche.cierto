# CocheCierto

> **Decide con datos. Compra con seguridad.**  
> *Asesor independiente para elegir, comparar y comprar coche.*

CocheCierto es una plataforma digital concebida para ayudar a cualquier persona a decidir qué vehículo comprar (nuevo, km 0, seminuevo o de ocasión), en qué condiciones y con qué nivel de riesgo, integrando datos económicos, técnicos y personales.

---

## 🎯 Pilares del Asesor CocheCierto

1. **Encaje de Uso Real:** Evalúa el perfil del comprador (familiar, novel, urbano, viajes largos, autónomo/profesional) para recomendar el tipo de vehículo y etiqueta ambiental óptima.
2. **Coste Real de Propiedad (TCO):** Analiza el coste integral mensual y anual: precio de compra / cuota de financiación, combustible o recarga eléctrica por municipio y kilometraje, seguro, mantenimiento, depreciación e impuestos.
3. **Diagnóstico de Riesgo e Incertidumbre:** Detecta puntos críticos antes de comprar, genera checklists de verificación y mantiene honestidad radical (la ausencia de datos no es garantía de buen estado).
4. **Decisiones Explicables y Accionables:** Genera informes claros con recomendaciones objetivas e independientes, sin sesgos comerciales (*"No vendemos coches. Te ayudamos a elegir el correcto"*).

---

## 🏗️ Estructura del Proyecto

`	ext
coche.cierto/
├── mvp-valorador/         # Frontend Web: Landing page, valorador interactivo, demo dashboard y recursos
│   ├── index.html         # Landing principal
│   ├── valorador/         # Formulario guiado de valoración paso a paso
│   ├── demo/              # Informe diagnóstico de ejemplo interactivo
│   ├── como-funciona/     # Explicación del proceso
│   ├── que-analizamos/    # Métricas y variables analizadas
│   └── metodologia/       # Principios y rigor de cálculo
├── backend/               # Backend API Node.js / Express
│   ├── src/server.js      # Servidor API REST y endpoints de valoración / leads
│   ├── schema.sql         # Esquema de base de datos MySQL
│   └── package.json       # Configuración y dependencias backend
├── docs/                  # Documentación estratégica, constitución y guías de marca
│   ├── constitution.md    # Principios innegociables de CocheCierto
│   ├── Propuesta_Maestra_Marca_CocheCierto.md
│   └── Guia_Tecnica_Implementacion_Marca_CocheCierto.md
├── specs/                 # Especificaciones por iniciativa (Spec-Driven Development)
└── AGENTS.md              # Contexto de agentes y gobernanza del proyecto
`

---

## 🚀 Inicio Rápido en Local

### 1. Frontend Web
Puedes abrir directamente mvp-valorador/index.html en el navegador o servirlo con cualquier servidor estático local:
`ash
# Ejemplo con npx serve
npx serve mvp-valorador
`

### 2. Backend API
`ash
cd backend
npm install
npm run dev
`

---

## 📜 Gobernanza y Metodología (SDD)

El desarrollo de CocheCierto se rige por **Spec-Driven Development (SDD)**:
Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación → Cambio.

Lee [docs/constitution.md](docs/constitution.md) antes de proponer cambios funcionales.
