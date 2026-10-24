# Diseno de Base de Datos - OdontoFlow

## Resumen

La base de datos de OdontoFlow esta disenada como un sistema **multi-tenant**:
varios consultorios usan la misma aplicacion y la misma base de datos, pero la
informacion operativa se separa con `clinic_id`.

La tabla central es `clinics`. Desde ella cuelgan usuarios, pacientes, citas,
tratamientos, imagenes clinicas y movimientos financieros.

```txt
clinics
+-- users
|   +-- accounts
|   +-- user_sessions
|   +-- password_reset_tokens
+-- patients
|   +-- appointments
|   +-- treatments
|   |   +-- clinical_images
|   +-- clinical_images
|   +-- income
+-- appointments
+-- treatments
+-- clinical_images
+-- income
+-- expense
+-- purchases
```

Regla principal:

```txt
Toda consulta operativa debe filtrar por clinic_id del usuario autenticado.
```

Nota de nombres: en Prisma los campos usan `camelCase` (`clinicId`,
`createdAt`), pero en PostgreSQL se guardan con nombres `snake_case`
(`clinic_id`, `created_at`) mediante `@map`.

---

## Enums

### `UserRole`

Roles permitidos para usuarios del sistema.

| Valor | Significado |
| --- | --- |
| `professional` | Usuario principal del consultorio. |
| `auxiliary` | Usuario auxiliar con permisos operativos limitados. |

### `AppointmentStatus`

Estados posibles de una cita.

| Valor | Significado |
| --- | --- |
| `programada` | Cita agendada. |
| `cancelada` | Cita cancelada. |
| `asistio` | El paciente asistio. |
| `no_asistio` | El paciente no asistio. |

### `TreatmentStatus`

Estados posibles de un tratamiento.

| Valor | Significado |
| --- | --- |
| `planificado` | Tratamiento planeado. |
| `en_proceso` | Tratamiento activo. |
| `finalizado` | Tratamiento terminado. |
| `cancelado` | Tratamiento cancelado. |

### `ClinicalImageType`

Tipos de imagen clinica.

| Valor | Significado |
| --- | --- |
| `imagen` | Imagen clinica general. |
| `radiografia` | Radiografia. |

---

## Tablas

## `clinics`

Representa un consultorio. Se crea automaticamente cuando un profesional se
registra.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico del consultorio. |
| `name` | `varchar` | Si | Nombre visible del consultorio. |
| `slug` | `varchar` | Si | Identificador legible y unico para el consultorio. |
| `logo_url` | `varchar` | No | URL opcional del logo del consultorio. |
| `is_active` | `boolean` | Si | Indica si el consultorio esta activo. Por defecto `true`. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |
| `updated_at` | `timestamptz` | Si | Fecha de ultima actualizacion. |

Relaciones:

- Tiene muchos `users`.
- Tiene muchos `patients`.
- Tiene muchas `appointments`.
- Tiene muchos `treatments`.
- Tiene muchas `clinical_images`.
- Tiene muchos `income`.
- Tiene muchos `expense`.
- Tiene muchas `purchases`.

Restricciones e indices:

- `slug` es unico.

---

## `users`

Representa usuarios autenticables del sistema. Cada usuario pertenece a un solo
consultorio.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico del usuario. |
| `clinic_id` | `uuid` | Si | Consultorio al que pertenece el usuario. |
| `username` | `varchar` | Si | Usuario usado para iniciar sesion. |
| `name` | `varchar` | No | Nombre visible del usuario. |
| `email` | `varchar` | Si | Correo del usuario, usado para recuperacion y seguridad. |
| `email_verified` | `timestamptz` | No | Fecha de verificacion de correo, compatible con Auth.js. |
| `image` | `varchar` | No | Imagen/avatar opcional, compatible con Auth.js. |
| `password_hash` | `varchar` | Si | Hash de la contrasena. Nunca se guarda la contrasena en texto plano. |
| `role` | `UserRole` | Si | Rol del usuario: `professional` o `auxiliary`. |
| `is_active` | `boolean` | Si | Indica si el usuario puede iniciar sesion. Por defecto `true`. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |
| `updated_at` | `timestamptz` | Si | Fecha de ultima actualizacion. |

Relaciones:

- Pertenece a `clinics` por `clinic_id`.
- Puede tener muchos `accounts` de Auth.js.
- Puede tener muchas `user_sessions`.
- Puede tener muchos `password_reset_tokens`.
- Puede crear muchas `appointments`.
- Puede subir muchas `clinical_images`.
- Puede crear muchos registros en `income`, `expense` y `purchases`.

Restricciones e indices:

- `username` es unico globalmente.
- `email` es unico globalmente.
- Indice por `clinic_id`.
- Indice por `clinic_id` + `role`.

Reglas:

- El login actual usa `username` + `password`.
- Un usuario inactivo no debe iniciar sesion.
- El backend siempre debe validar `clinic_id` y `role`.

---

## `accounts`

Tabla compatible con Auth.js para cuentas de proveedores externos. Aunque el MVP
usa credenciales, esta tabla permite mantener compatibilidad con el adaptador de
Auth.js.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico de la cuenta. |
| `user_id` | `uuid` | Si | Usuario al que pertenece la cuenta. |
| `type` | `varchar` | Si | Tipo de cuenta segun Auth.js. |
| `provider` | `varchar` | Si | Proveedor de autenticacion. |
| `provider_account_id` | `varchar` | Si | ID del usuario en el proveedor. |
| `refresh_token` | `text` | No | Token de refresco del proveedor. |
| `access_token` | `text` | No | Token de acceso del proveedor. |
| `expires_at` | `int` | No | Expiracion del token en formato Unix. |
| `token_type` | `varchar` | No | Tipo del token. |
| `scope` | `varchar` | No | Alcances autorizados. |
| `id_token` | `text` | No | Token de identidad. |
| `session_state` | `varchar` | No | Estado de sesion del proveedor. |

Relaciones:

- Pertenece a `users` por `user_id`.
- Si el usuario se elimina, sus cuentas se eliminan en cascada.

Restricciones e indices:

- Combinacion unica `provider` + `provider_account_id`.
- Indice por `user_id`.

---

## `user_sessions`

Tabla compatible con Auth.js para sesiones persistidas. El flujo actual usa JWT,
pero la tabla queda disponible por compatibilidad con el adaptador.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico de la sesion. |
| `session_token` | `varchar` | Si | Token unico de sesion. |
| `user_id` | `uuid` | Si | Usuario propietario de la sesion. |
| `expires_at` | `timestamptz` | Si | Fecha de expiracion. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |

Relaciones:

- Pertenece a `users` por `user_id`.
- Si el usuario se elimina, sus sesiones se eliminan en cascada.

Restricciones e indices:

- `session_token` es unico.
- Indice por `user_id`.

---

## `verification_tokens`

Tabla compatible con Auth.js para flujos de verificacion, por ejemplo email
providers o verificacion futura de correo.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `identifier` | `varchar` | Si | Identificador del flujo de verificacion. |
| `token` | `varchar` | Si | Token unico de verificacion. |
| `expires` | `timestamptz` | Si | Fecha de expiracion del token. |

Restricciones:

- `token` es unico.
- Combinacion unica `identifier` + `token`.

---

## `password_reset_tokens`

Representa tokens para recuperacion de contrasena.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico del token. |
| `user_id` | `uuid` | Si | Usuario que solicito la recuperacion. |
| `token` | `varchar` | Si | Token unico de recuperacion. |
| `expires_at` | `timestamptz` | Si | Fecha de expiracion. |
| `used_at` | `timestamptz` | No | Fecha en la que el token fue usado. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |

Relaciones:

- Pertenece a `users` por `user_id`.
- Si el usuario se elimina, sus tokens se eliminan en cascada.

Restricciones e indices:

- `token` es unico.
- Indice por `user_id`.

Reglas:

- Un token vencido no debe aceptarse.
- Un token con `used_at` no debe reutilizarse.

---

## `patients`

Representa pacientes registrados en un consultorio.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico del paciente. |
| `clinic_id` | `uuid` | Si | Consultorio al que pertenece el paciente. |
| `document_type` | `varchar` | Si | Tipo de documento del paciente. |
| `document_number` | `varchar` | Si | Numero de documento del paciente. |
| `first_name` | `varchar` | Si | Nombres del paciente. |
| `last_name` | `varchar` | Si | Apellidos del paciente. |
| `phone` | `varchar` | No | Telefono opcional. |
| `email` | `varchar` | No | Correo opcional. |
| `notes` | `text` | No | Observaciones generales. |
| `is_active` | `boolean` | Si | Permite desactivar pacientes sin eliminar historial. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |
| `updated_at` | `timestamptz` | Si | Fecha de ultima actualizacion. |

Relaciones:

- Pertenece a `clinics` por `clinic_id`.
- Tiene muchas `appointments`.
- Tiene muchos `treatments`.
- Tiene muchas `clinical_images`.
- Puede tener muchos registros de `income`.

Restricciones e indices:

- Documento unico por consultorio: `clinic_id` + `document_type` + `document_number`.
- Indice por `clinic_id`.
- Indice por `clinic_id` + `last_name` + `first_name`.

---

## `appointments`

Representa citas del consultorio en la agenda.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico de la cita. |
| `clinic_id` | `uuid` | Si | Consultorio al que pertenece la cita. |
| `patient_id` | `uuid` | Si | Paciente asociado a la cita. |
| `created_by` | `uuid` | Si | Usuario que creo la cita. |
| `title` | `varchar` | Si | Motivo o titulo de la cita. |
| `start_at` | `timestamptz` | Si | Fecha y hora de inicio. |
| `end_at` | `timestamptz` | Si | Fecha y hora de finalizacion. |
| `status` | `AppointmentStatus` | Si | Estado de la cita. Por defecto `programada`. |
| `notes` | `text` | No | Observaciones adicionales. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |
| `updated_at` | `timestamptz` | Si | Fecha de ultima actualizacion. |

Relaciones:

- Pertenece a `clinics` por `clinic_id`.
- Pertenece a `patients` por `patient_id`.
- Fue creada por `users` mediante `created_by`.

Restricciones e indices:

- Indice por `clinic_id` + `start_at` para consultar agenda por fecha.
- Indice por `clinic_id` + `patient_id` para historial del paciente.
- Indice por `created_by`.

---

## `treatments`

Representa tratamientos asociados a pacientes.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico del tratamiento. |
| `clinic_id` | `uuid` | Si | Consultorio al que pertenece el tratamiento. |
| `patient_id` | `uuid` | Si | Paciente asociado. |
| `name` | `varchar` | Si | Nombre del tratamiento. |
| `description` | `text` | No | Descripcion del tratamiento. |
| `tooth` | `varchar` | No | Diente o zona asociada. |
| `status` | `TreatmentStatus` | Si | Estado del tratamiento. Por defecto `planificado`. |
| `started_at` | `date` | No | Fecha de inicio. |
| `completed_at` | `date` | No | Fecha de finalizacion. |
| `notes` | `text` | No | Observaciones. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |
| `updated_at` | `timestamptz` | Si | Fecha de ultima actualizacion. |

Relaciones:

- Pertenece a `clinics` por `clinic_id`.
- Pertenece a `patients` por `patient_id`.
- Puede tener muchas `clinical_images`.

Restricciones e indices:

- Indice por `clinic_id` + `patient_id`.
- Indice por `clinic_id` + `status`.

---

## `clinical_images`

Representa imagenes clinicas opcionales. Los archivos se almacenan fuera de la
base de datos, por ejemplo en Cloudinary; la base guarda URL y metadatos.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico de la imagen. |
| `clinic_id` | `uuid` | Si | Consultorio al que pertenece la imagen. |
| `patient_id` | `uuid` | Si | Paciente asociado. |
| `treatment_id` | `uuid` | No | Tratamiento asociado, si aplica. |
| `url` | `varchar` | Si | URL de la imagen externa. |
| `type` | `ClinicalImageType` | Si | Tipo de imagen: `imagen` o `radiografia`. |
| `description` | `varchar` | No | Descripcion opcional. |
| `taken_at` | `date` | No | Fecha en la que fue tomada. |
| `uploaded_by` | `uuid` | Si | Usuario que subio la imagen. |
| `created_at` | `timestamptz` | Si | Fecha de creacion del registro. |

Relaciones:

- Pertenece a `clinics` por `clinic_id`.
- Pertenece a `patients` por `patient_id`.
- Puede pertenecer a `treatments` por `treatment_id`.
- Fue subida por `users` mediante `uploaded_by`.

Restricciones e indices:

- Indice por `clinic_id` + `patient_id`.
- Indice por `clinic_id` + `treatment_id`.
- Indice por `uploaded_by`.

---

## `income`

Representa ingresos del consultorio.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico del ingreso. |
| `clinic_id` | `uuid` | Si | Consultorio al que pertenece el ingreso. |
| `patient_id` | `uuid` | No | Paciente relacionado, si aplica. |
| `date` | `date` | Si | Fecha del ingreso. |
| `concept` | `varchar` | Si | Concepto del ingreso. |
| `amount` | `decimal(12,2)` | Si | Valor monetario. |
| `notes` | `text` | No | Observaciones. |
| `created_by` | `uuid` | Si | Usuario que registro el ingreso. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |

Relaciones:

- Pertenece a `clinics` por `clinic_id`.
- Puede pertenecer a `patients` por `patient_id`.
- Fue creado por `users` mediante `created_by`.

Restricciones e indices:

- Indice por `clinic_id` + `date`.
- Indice por `clinic_id` + `patient_id`.
- Indice por `created_by`.

---

## `expense`

Representa egresos generales del consultorio.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico del egreso. |
| `clinic_id` | `uuid` | Si | Consultorio al que pertenece el egreso. |
| `date` | `date` | Si | Fecha del egreso. |
| `concept` | `varchar` | Si | Concepto del egreso. |
| `amount` | `decimal(12,2)` | Si | Valor monetario. |
| `category` | `varchar` | No | Categoria opcional. |
| `notes` | `text` | No | Observaciones. |
| `created_by` | `uuid` | Si | Usuario que registro el egreso. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |

Relaciones:

- Pertenece a `clinics` por `clinic_id`.
- Fue creado por `users` mediante `created_by`.

Restricciones e indices:

- Indice por `clinic_id` + `date`.
- Indice por `created_by`.

---

## `purchases`

Representa compras realizadas por el consultorio.

| Campo | Tipo | Requerido | Descripcion |
| --- | --- | --- | --- |
| `id` | `uuid` | Si | Identificador unico de la compra. |
| `clinic_id` | `uuid` | Si | Consultorio al que pertenece la compra. |
| `date` | `date` | Si | Fecha de compra. |
| `supplier` | `varchar` | Si | Proveedor. |
| `description` | `varchar` | Si | Descripcion de la compra. |
| `amount` | `decimal(12,2)` | Si | Valor monetario. |
| `notes` | `text` | No | Observaciones. |
| `created_by` | `uuid` | Si | Usuario que registro la compra. |
| `created_at` | `timestamptz` | Si | Fecha de creacion. |

Relaciones:

- Pertenece a `clinics` por `clinic_id`.
- Fue creada por `users` mediante `created_by`.

Restricciones e indices:

- Indice por `clinic_id` + `date`.
- Indice por `created_by`.

---

## Reglas de integridad y seguridad

## Aislamiento multi-tenant

- Toda tabla operativa tiene `clinic_id`.
- Las consultas de pacientes, citas, tratamientos, imagenes y finanzas deben
  filtrar por `clinic_id`.
- No basta ocultar datos en frontend; la validacion debe hacerse en servidor.
- Cuando una tabla tambien referencia otra entidad, por ejemplo
  `appointments.patient_id`, el backend debe validar que ambas entidades
  pertenezcan al mismo `clinic_id`.

## Identificadores

- Los IDs principales son UUID.
- Esto evita depender de IDs secuenciales y facilita crecer a multiples
  consultorios.

## Timestamps

- Las entidades editables importantes usan `created_at` y `updated_at`.
- Los registros financieros actuales tienen `created_at`, pero no `updated_at`,
  porque se espera conservar trazabilidad y evitar ediciones silenciosas.

## Eliminacion y desactivacion

- `clinics`, `users` y `patients` tienen `is_active`.
- Para informacion sensible u operativa se debe preferir desactivar antes que
  eliminar.
- Las tablas de Auth.js (`accounts`, `user_sessions`, `password_reset_tokens`)
  usan borrado en cascada al eliminar un usuario.

## Dinero

- Los montos usan `decimal(12,2)`.
- No se deben usar `float` o `double` para valores monetarios.

## Imagenes clinicas

- La base de datos no almacena binarios.
- Solo guarda `url`, `type`, descripcion y referencias a consultorio, paciente,
  tratamiento y usuario que subio la imagen.

---

## Estado actual

El esquema y la migracion inicial cubren las entidades del MVP. La implementacion
funcional actual incluye autenticacion, creacion automatica de consultorio,
pacientes y citas. Las consultas y mutaciones de pacientes y citas validan el
`clinic_id` de la sesion en el servidor.

Pendiente para futuras iteraciones:

- Aplicar la migracion inicial en cada entorno de despliegue.
- Implementar tratamientos, imagenes clinicas y finanzas sobre estas entidades.
- Implementar administracion de auxiliares y permisos por rol.
- Implementar auditoria si se requiere trazabilidad detallada de cambios.
- Definir reglas de edicion/anulacion para registros financieros.
