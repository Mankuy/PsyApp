# PsyApp SaaS – Psicología Management Platform

Una solución **SaaS** (Software as a Service) para psicólogos y psicólogas que permite:
- Gestión de agenda y citas (calendario sincronizable)
- Control de pagos (sesiones individuales y suscripciones mensuales)
- Portal de pacientes con auto‑agendamiento y historial de pagos
- Módulos opcionales de IA: resumen de notas, análisis de tono, sugerencias de horarios, recordatorios inteligentes
- Arquitectura modular: cada funcionalidad vive en su propio paquete y puede activarse/desactivarse según el plan
- Diseño top‑tier: UI basada en sistema de diseños accesible, componentes reutilizables y tema claro/oscuro

## Estructura del monorepo (pnpm workspace)

```
psyapp-saas/
├── apps/                 # Aplicaciones desplegables (web, admin portal)
├── packages/
│   ├── api/              # Backend NestJS/Express + Prisma
│   ├── web/              # Frontend React (Vite) + Tailwind + shadcn/ui
│   ├── ai/               # Servicios de IA (note‑summarizer, sentiment, smart‑scheduler)
│   ├── payments/         # Integración Stripe (sesiones y suscripciones)
│   ├── scheduling/       # Lógica de calendario, disponibilidad, regla de negocio
│   ├── notifications/    # Email/SMS via SendGrid & Twilio
│   └── core/             # Tipos compartidos, utils, auth utilities
├── docs/                 # Documentación de arquitectura, decisiones, API specs
├── docker-compose.yml    # Entorno de desarrollo (Postgres, Redis, Mailhog)
└── pnpm-workspace.yaml   # Configuración del workspace
```

## Principios de diseño

- **Modularidad y plug‑and‑play**: cada paquete expone una API bien definida (REST/GraphQL o gRPC) y se puede excluir del build si no se necesita (p.ej., plan básico sin IA).
- **Multi‑tenant seguro**: esquema de base de datos compartido con Row Level Security (RLS) en PostgreSQL; cada psicólogo tiene su `psychologist_id` que filtra todas las tablas sensibles.
- **Extensibilidad vía webhooks**: los eventos clave (cita creada, pago exitoso, nota actualizada) disparan webhooks que pueden ser consumidos por funciones de IA o por integraciones externas (Google Calendar, Zoom, etc.).
- **Experiencia de primera clase**: UI construida con componentes accesibles, modo claro/oscuro, micro‑interacciones suaves y flow de onboarding guiado.
- **Cumplimiento**: cifrado de datos sensibles (notas, datos de pago) a nivel de columna, logs de auditoría y listos para GDPR/ley uruguaya de protección de datos.

## Próximos pasos sugeridos

1. **Definir modelo de datos** (Prisma) en `packages/api/schema.prisma`.
2. **Crear el servicio de autenticación** (JWT + refresh) y rol‑based access control.
3. **Implementar el módulo de pagos** con Stripe (Checkout para sesiones, Subscription para planes).
4. **Construir el calendario** (FullCalendar) y la lógica de disponibilidad.
5. **Desarrollar el portal de pacientes** (registro, vista de citas, pago).
6. **Agregar módulos de IA opcionales**:
   - Note Summarizer (LLM vía OpenRouter / NVIDIA NIM)
   - Sentiment Analysis (texto de notas → escala de bienestar)
   - Smart Scheduler (sugiere horarios basado en historial y preferencias)
   - Automatizador de recordatorios (redacción de mensajes según contexto)
7. **Configurar CI/CD** (GitHub Actions) que haga lint, test, build y despliegue a un entorno de preview (Render/Fly.io).
8. **Crear documentación de usuario** y guía de onboarding para psicólogos.

---
*Este README es el punto de partida. Cada paquete se irá poblando con código de producción conforme avance el proyecto.*