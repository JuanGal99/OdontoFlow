# OdontoFlow

OdontoFlow es una plataforma web privada para la gestión operativa de consultorios odontológicos independientes.

El sistema está diseñado para odontólogos que trabajan solos o con auxiliar, permitiendo organizar pacientes, citas, tratamientos, imágenes clínicas opcionales y movimientos financieros básicos desde una interfaz moderna, simple y centralizada.

---

## Objetivo

Construir un SaaS moderno, intuitivo y seguro para pequeños consultorios odontológicos, priorizando una experiencia clara y rápida tanto para el profesional como para su auxiliar.

---

## Problema

Muchos consultorios pequeños gestionan su operación diaria utilizando WhatsApp, agendas físicas, hojas de cálculo o notas dispersas.

Esto puede generar:

- pérdida de información;
- dificultad para organizar citas;
- poca trazabilidad de tratamientos;
- control financiero limitado;
- dependencia excesiva de procesos manuales.

OdontoFlow busca centralizar estos procesos en una sola plataforma privada y organizada.

---

## Características principales

- Gestión de consultorios independientes.
- Separación total de información entre consultorios.
- Sistema de autenticación.
- Roles básicos:
  - Profesional
  - Auxiliar
- Gestión de pacientes.
- Agenda de citas.
- Registro de tratamientos.
- Imágenes clínicas opcionales.
- Registro de ingresos y egresos.
- Registro de compras del consultorio.
- Interfaz responsive orientada principalmente a PC y tablet.

---

## Modelo multi-consultorio

Cada consultorio funciona como un espacio privado e independiente.

La información de un consultorio nunca se mezcla con la de otro.

```txt
Consultorio A
 ├── Profesional
 ├── Auxiliar opcional
 ├── Pacientes
 ├── Citas
 ├── Tratamientos
 ├── Imágenes clínicas
 └── Finanzas

Consultorio B
 ├── Profesional
 ├── Auxiliar opcional
 ├── Pacientes
 ├── Citas
 ├── Tratamientos
 ├── Imágenes clínicas
 └── Finanzas
```

---

## Roles

### Profesional

Usuario principal del consultorio.

Tiene acceso completo a la información y configuración de su consultorio.

Puede:

- gestionar pacientes;
- crear, editar y cancelar citas;
- registrar tratamientos;
- subir imágenes clínicas;
- registrar ingresos, egresos y compras;
- crear o desactivar auxiliares;
- consultar reportes básicos.

---

### Auxiliar

Usuario operativo opcional del consultorio.

Puede:

- gestionar citas;
- registrar pacientes;
- actualizar información básica;
- registrar movimientos básicos autorizados.

No puede:

- administrar usuarios;
- eliminar información crítica;
- acceder a configuración avanzada.

---

## Stack tecnológico

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- Auth.js
- Cloudinary

---

## Arquitectura general

```txt
Frontend/UI
↓
Next.js Fullstack
↓
Prisma ORM
↓
PostgreSQL
```

Las imágenes clínicas se almacenan externamente mediante Cloudinary.

---

## Estructura inicial del proyecto

```txt
odontoflow/
├── app/
├── components/
├── lib/
├── prisma/
├── public/
├── docs/
├── middleware.ts
├── README.md
└── package.json
```

---

## Documentación

La documentación técnica y funcional se encuentra en la carpeta `docs/`.

Documentos planeados:

- requirements.md
- architecture.md
- database-design.md
- auth-and-permissions.md
- roadmap.md
- diagrams/

---

## Roadmap resumido

### MVP

- Registro e inicio de sesión.
- Creación automática de consultorio.
- Gestión de auxiliares.
- Gestión de pacientes.
- Agenda de citas.
- Registro de tratamientos.
- Registro financiero básico.
- Imágenes clínicas opcionales.

### Futuras mejoras

- Recordatorios por WhatsApp.
- Reportes avanzados.
- Portal para pacientes.
- Auditoría de acciones.
- Inventario más completo.

---

## Licencia

Este proyecto está bajo la licencia MIT.
