# Diseño de Base de Datos - OdontoFlow

## Descripción general

La base de datos de OdontoFlow está diseñada bajo un enfoque **multi-tenant**.

Esto significa que varios consultorios pueden usar la misma aplicación y la misma base de datos, pero cada consultorio mantiene su información separada mediante el campo `clinic_id`.

Cada usuario, paciente, cita, tratamiento, imagen clínica y movimiento financiero pertenece a un consultorio específico.

---

## Principio multi-tenant

Cada consultorio funciona como un espacio independiente dentro del sistema.

```txt
clinics
 ├── users
 ├── patients
 ├── appointments
 ├── treatments
 ├── clinical_images
 ├── income
 ├── expense
 └── purchases
```

La regla principal del sistema es:

```txt
Un usuario solo puede consultar y modificar información de su propio consultorio.
```

---

# Entidades principales

## clinics

Representa un consultorio dentro del sistema.

El consultorio se crea automáticamente cuando un profesional se registra.

### Campos principales

| Campo      | Tipo          | Descripción                          |
| ---------- | ------------- | ------------------------------------ |
| id         | uuid          | Identificador único del consultorio. |
| name       | varchar       | Nombre del consultorio.              |
| slug       | varchar       | Identificador único legible.         |
| logo_url   | varchar, null | Logo opcional del consultorio.       |
| is_active  | boolean       | Estado del consultorio.              |
| created_at | timestamp     | Fecha de creación.                   |
| updated_at | timestamp     | Fecha de actualización.              |

### Relaciones

- Un consultorio tiene muchos usuarios.
- Un consultorio tiene muchos pacientes.
- Un consultorio tiene muchas citas.
- Un consultorio tiene muchos tratamientos.
- Un consultorio tiene muchas imágenes clínicas.
- Un consultorio tiene muchos ingresos.
- Un consultorio tiene muchos egresos.
- Un consultorio tiene muchas compras.

---

## users

Representa los usuarios del sistema.

Cada usuario pertenece a un consultorio.

### Campos principales

| Campo      | Tipo      | Descripción                             |
| ---------- | --------- | --------------------------------------- |
| id         | uuid      | Identificador único del usuario.        |
| clinic_id  | uuid      | Consultorio al que pertenece.           |
| username   | varchar   | Usuario para iniciar sesión.            |
| email      | varchar   | Correo para recuperación de contraseña. |
| password   | varchar   | Contraseña cifrada.                     |
| role       | enum      | Rol dentro del sistema.                 |
| is_active  | boolean   | Estado del usuario.                     |
| created_at | timestamp | Fecha de creación.                      |
| updated_at | timestamp | Fecha de actualización.                 |

### Roles permitidos

```txt
professional
auxiliary
```

### Reglas

- El login se realiza usando `username` y `password`.
- El correo se usa para recuperación de contraseña.
- Las contraseñas nunca deben almacenarse en texto plano.
- Un usuario inactivo no puede iniciar sesión.

### Relaciones

- Un usuario pertenece a un consultorio.
- Un usuario puede crear citas.
- Un usuario puede registrar movimientos financieros.
- Un usuario puede subir imágenes clínicas.
- Un usuario puede tener sesiones activas.
- Un usuario puede solicitar recuperación de contraseña.

---

## user_sessions

Representa sesiones activas de usuarios autenticados.

### Campos principales

| Campo         | Tipo      | Descripción                       |
| ------------- | --------- | --------------------------------- |
| id            | uuid      | Identificador único de la sesión. |
| user_id       | uuid      | Usuario dueño de la sesión.       |
| session_token | varchar   | Token de sesión.                  |
| expires_at    | timestamp | Fecha de expiración.              |
| created_at    | timestamp | Fecha de creación.                |

### Relaciones

- Una sesión pertenece a un usuario.
- Un usuario puede tener varias sesiones.

---

## password_reset_tokens

Representa tokens de recuperación de contraseña.

### Campos principales

| Campo      | Tipo            | Descripción                    |
| ---------- | --------------- | ------------------------------ |
| id         | uuid            | Identificador único del token. |
| user_id    | uuid            | Usuario asociado.              |
| token      | varchar         | Token único de recuperación.   |
| expires_at | timestamp       | Fecha de expiración.           |
| used_at    | timestamp, null | Fecha de uso del token.        |
| created_at | timestamp       | Fecha de creación.             |

### Relaciones

- Un token pertenece a un usuario.
- Un usuario puede tener múltiples tokens.

---

## patients

Representa pacientes registrados en el sistema.

### Campos principales

| Campo           | Tipo          | Descripción                       |
| --------------- | ------------- | --------------------------------- |
| id              | uuid          | Identificador único del paciente. |
| clinic_id       | uuid          | Consultorio al que pertenece.     |
| document_type   | varchar       | Tipo de documento.                |
| document_number | varchar       | Número de documento.              |
| first_name      | varchar       | Nombres del paciente.             |
| last_name       | varchar       | Apellidos del paciente.           |
| phone           | varchar, null | Teléfono del paciente.            |
| email           | varchar, null | Correo del paciente.              |
| notes           | text, null    | Observaciones generales.          |
| created_at      | timestamp     | Fecha de creación.                |
| updated_at      | timestamp     | Fecha de actualización.           |

### Relaciones

- Un paciente pertenece a un consultorio.
- Un paciente puede tener muchas citas.
- Un paciente puede tener muchos tratamientos.
- Un paciente puede tener muchas imágenes clínicas.
- Un paciente puede estar asociado a ingresos.

---

## appointments

Representa las citas registradas en la agenda.

### Campos principales

| Campo      | Tipo       | Descripción                     |
| ---------- | ---------- | ------------------------------- |
| id         | uuid       | Identificador único de la cita. |
| clinic_id  | uuid       | Consultorio al que pertenece.   |
| patient_id | uuid       | Paciente asociado.              |
| created_by | uuid       | Usuario que creó la cita.       |
| title      | varchar    | Motivo o título de la cita.     |
| start_at   | timestamp  | Fecha y hora de inicio.         |
| end_at     | timestamp  | Fecha y hora de finalización.   |
| status     | enum       | Estado de la cita.              |
| notes      | text, null | Observaciones adicionales.      |
| created_at | timestamp  | Fecha de creación.              |
| updated_at | timestamp  | Fecha de actualización.         |

### Estados permitidos

```txt
programada
cancelada
asistio
no_asistio
```

### Relaciones

- Una cita pertenece a un consultorio.
- Una cita pertenece a un paciente.
- Una cita es creada por un usuario.

---

## treatments

Representa tratamientos asociados a pacientes.

### Campos principales

| Campo        | Tipo          | Descripción                          |
| ------------ | ------------- | ------------------------------------ |
| id           | uuid          | Identificador único del tratamiento. |
| clinic_id    | uuid          | Consultorio asociado.                |
| patient_id   | uuid          | Paciente asociado.                   |
| name         | varchar       | Nombre del tratamiento.              |
| description  | text, null    | Descripción del tratamiento.         |
| tooth        | varchar, null | Diente asociado.                     |
| status       | enum          | Estado del tratamiento.              |
| started_at   | date, null    | Fecha de inicio.                     |
| completed_at | date, null    | Fecha de finalización.               |
| notes        | text, null    | Observaciones.                       |
| created_at   | timestamp     | Fecha de creación.                   |
| updated_at   | timestamp     | Fecha de actualización.              |

### Estados permitidos

```txt
planificado
en_proceso
finalizado
cancelado
```

### Relaciones

- Un tratamiento pertenece a un consultorio.
- Un tratamiento pertenece a un paciente.
- Un tratamiento puede tener imágenes clínicas asociadas.

---

## clinical_images

Representa imágenes clínicas opcionales.

### Campos principales

| Campo        | Tipo          | Descripción                     |
| ------------ | ------------- | ------------------------------- |
| id           | uuid          | Identificador único.            |
| clinic_id    | uuid          | Consultorio asociado.           |
| patient_id   | uuid          | Paciente asociado.              |
| treatment_id | uuid, null    | Tratamiento asociado.           |
| url          | varchar       | URL de la imagen en Cloudinary. |
| type         | enum          | Tipo de imagen.                 |
| description  | varchar, null | Descripción opcional.           |
| taken_at     | date, null    | Fecha de captura.               |
| uploaded_by  | uuid          | Usuario que subió la imagen.    |
| created_at   | timestamp     | Fecha de creación.              |

### Tipos permitidos

```txt
imagen
radiografia
```

### Reglas

- Las imágenes son opcionales.
- Las imágenes se almacenan en Cloudinary.
- En la base de datos solo se guarda la URL.

### Relaciones

- Una imagen pertenece a un consultorio.
- Una imagen puede pertenecer a un paciente.
- Una imagen puede pertenecer a un tratamiento.
- Una imagen es subida por un usuario.

---

## income

Representa ingresos del consultorio.

### Campos principales

| Campo      | Tipo       | Descripción                      |
| ---------- | ---------- | -------------------------------- |
| id         | uuid       | Identificador único.             |
| clinic_id  | uuid       | Consultorio asociado.            |
| patient_id | uuid, null | Paciente relacionado.            |
| date       | date       | Fecha del ingreso.               |
| concept    | varchar    | Concepto del ingreso.            |
| amount     | decimal    | Valor monetario.                 |
| notes      | text, null | Observaciones.                   |
| created_by | uuid       | Usuario que registró el ingreso. |
| created_at | timestamp  | Fecha de creación.               |

### Relaciones

- Un ingreso pertenece a un consultorio.
- Un ingreso puede estar asociado a un paciente.
- Un ingreso es creado por un usuario.

---

## expense

Representa egresos generales del consultorio.

### Campos principales

| Campo      | Tipo          | Descripción                     |
| ---------- | ------------- | ------------------------------- |
| id         | uuid          | Identificador único.            |
| clinic_id  | uuid          | Consultorio asociado.           |
| date       | date          | Fecha del egreso.               |
| concept    | varchar       | Concepto del egreso.            |
| amount     | decimal       | Valor monetario.                |
| category   | varchar, null | Categoría del egreso.           |
| notes      | text, null    | Observaciones.                  |
| created_by | uuid          | Usuario que registró el egreso. |
| created_at | timestamp     | Fecha de creación.              |

### Relaciones

- Un egreso pertenece a un consultorio.
- Un egreso es creado por un usuario.

---

## purchases

Representa compras realizadas por el consultorio.

### Campos principales

| Campo       | Tipo       | Descripción                     |
| ----------- | ---------- | ------------------------------- |
| id          | uuid       | Identificador único.            |
| clinic_id   | uuid       | Consultorio asociado.           |
| date        | date       | Fecha de compra.                |
| supplier    | varchar    | Proveedor.                      |
| description | varchar    | Descripción de la compra.       |
| amount      | decimal    | Valor de la compra.             |
| notes       | text, null | Observaciones.                  |
| created_by  | uuid       | Usuario que registró la compra. |
| created_at  | timestamp  | Fecha de creación.              |

### Relaciones

- Una compra pertenece a un consultorio.
- Una compra es creada por un usuario.

---

# Reglas generales del sistema

## Seguridad

- Las contraseñas deben almacenarse cifradas.
- Las sesiones deben tener expiración.
- El backend debe validar permisos en cada operación.

---

## Aislamiento de datos

Todas las consultas deben filtrarse por `clinic_id`.

Ningún usuario debe acceder a información de otro consultorio.

---

## Integridad de información

- Los registros financieros no deben eliminarse fácilmente.
- Las imágenes clínicas son opcionales.
- El historial operativo debe conservar trazabilidad.

---

## Escalabilidad

La estructura actual permite:

- múltiples consultorios;
- múltiples usuarios;
- crecimiento modular;
- futuras integraciones SaaS.
