# Arquitectura - OdontoFlow

## Enfoque

OdontoFlow es una aplicacion Next.js fullstack con PostgreSQL y Prisma. Opera
como un SaaS multi-tenant: cada registro operativo pertenece a un consultorio
mediante `clinic_id` y nunca se consulta sin el contexto de la sesion.

## Capas actuales

```txt
app/                 Rutas y pantallas de Next.js
components/          Componentes de interfaz reutilizables
lib/auth/            Contexto de sesion autenticada y validacion de usuario
lib/patients/        Validacion, consultas, servicios y acciones de pacientes
lib/appointments/    Validacion, consultas, servicios y acciones de citas
prisma/              Esquema, migraciones y datos de demostracion
```

## Flujo de una operacion protegida

```txt
Pantalla o componente
  -> Server Action
  -> getAuthenticatedSessionContext()
  -> servicio del modulo
  -> consulta Prisma filtrada por clinicId
```

El contexto de sesion valida que el usuario, su rol y su consultorio sigan
activos antes de permitir operaciones de pacientes o citas. Los servicios de
citas tambien validan que el paciente y el creador pertenezcan al mismo
consultorio.

## Estado de implementacion

- Implementado: autenticacion por credenciales, registro de profesional,
  creacion de consultorio, pacientes y citas.
- Definido en el esquema, pendiente de modulo funcional: auxiliares,
  tratamientos, imagenes clinicas y finanzas.
- Pendiente: middleware global de rutas, control de permisos por rol en cada
  accion y pruebas automatizadas de aislamiento entre consultorios.
