# Autenticación y Permisos - OdontoFlow

## Descripción general

OdontoFlow utiliza autenticación y control de permisos para garantizar que cada usuario solo pueda acceder a la información correspondiente a su consultorio.

El sistema está diseñado bajo un modelo multi-tenant, donde múltiples consultorios utilizan la misma plataforma sin compartir datos entre ellos.

---

# Objetivos del sistema de autenticación

- Proteger rutas privadas.
- Validar identidad de usuarios.
- Separar información entre consultorios.
- Limitar acciones según el rol del usuario.
- Mantener sesiones seguras.
- Permitir recuperación de contraseña.
- Garantizar aislamiento de información.

---

# Modelo multi-tenant

Cada usuario pertenece a un consultorio mediante el campo:

```txt
clinic_id
```

Toda operación dentro del sistema debe validarse usando este identificador.

Ejemplo:

```txt
Usuario A → clinic_id = 1
Paciente X → clinic_id = 1
Acceso permitido
```

```txt
Usuario A → clinic_id = 1
Paciente Y → clinic_id = 2
Acceso denegado
```

---

# Inicio de sesión

Los usuarios acceden utilizando:

- username
- password

El correo electrónico no se utiliza para login.

El correo se utiliza únicamente para:

- recuperación de contraseña;
- notificaciones futuras;
- procesos de seguridad.

---

# Roles del sistema

OdontoFlow utiliza dos roles principales:

```txt
professional
auxiliary
```

---

# Rol: Professional

El profesional es el usuario principal del consultorio.

Tiene acceso completo a la información y configuración de su consultorio.

---

## Permisos del profesional

Puede:

- gestionar pacientes;
- crear pacientes;
- editar pacientes;
- eliminar o desactivar pacientes;
- gestionar citas;
- gestionar tratamientos;
- subir imágenes clínicas;
- registrar ingresos;
- registrar egresos;
- registrar compras;
- consultar reportes;
- crear auxiliares;
- desactivar auxiliares;
- editar información básica del consultorio.

---

## Restricciones del profesional

El profesional:

- no puede acceder a información de otros consultorios;
- no puede modificar registros externos;
- no puede alterar sesiones de otros consultorios.

---

# Rol: Auxiliary

El auxiliar es un usuario operativo opcional del consultorio.

Su objetivo es apoyar tareas administrativas y operativas sin tener control total del sistema.

---

## Permisos del auxiliar

Puede:

- consultar pacientes;
- crear pacientes;
- editar información básica de pacientes;
- consultar agenda;
- crear citas;
- editar citas;
- cancelar citas;
- registrar ingresos básicos;
- registrar egresos básicos;
- registrar compras básicas.

---

## Restricciones del auxiliar

No puede:

- crear usuarios;
- desactivar usuarios;
- cambiar configuración del consultorio;
- acceder a permisos avanzados;
- eliminar información crítica;
- gestionar tratamientos avanzados;
- acceder a funcionalidades administrativas completas.

---

# Tabla resumida de permisos

| Acción                     | Professional | Auxiliary |
| -------------------------- | ------------ | --------- |
| Ver dashboard              | Sí           | Sí        |
| Crear pacientes            | Sí           | Sí        |
| Editar pacientes           | Sí           | Sí        |
| Eliminar pacientes         | Sí           | No        |
| Buscar pacientes           | Sí           | Sí        |
| Crear citas                | Sí           | Sí        |
| Editar citas               | Sí           | Sí        |
| Cancelar citas             | Sí           | Sí        |
| Ver agenda                 | Sí           | Sí        |
| Crear tratamientos         | Sí           | No        |
| Editar tratamientos        | Sí           | No        |
| Ver historial tratamientos | Sí           | Limitado  |
| Subir imágenes clínicas    | Sí           | No        |
| Registrar ingresos         | Sí           | Sí        |
| Registrar egresos          | Sí           | Sí        |
| Registrar compras          | Sí           | Sí        |
| Ver reportes               | Sí           | Limitado  |
| Crear auxiliares           | Sí           | No        |
| Desactivar auxiliares      | Sí           | No        |
| Editar consultorio         | Sí           | No        |

---

# Protección de rutas

Las rutas privadas solo deben estar disponibles para usuarios autenticados.

---

## Ejemplos de rutas privadas

```txt
/dashboard
/patients
/appointments
/treatments
/finances
/settings
```

---

## Reglas de protección

- Si el usuario no está autenticado, debe ser redirigido al login.
- Si el usuario no tiene permisos suficientes, debe recibir acceso denegado.
- Todas las consultas deben validarse usando `clinic_id`.

---

# Sesiones

El sistema utiliza sesiones autenticadas para mantener el acceso del usuario.

Cada sesión debe incluir:

- user_id
- clinic_id
- role
- expiration

---

## Reglas de sesión

- Las sesiones deben expirar automáticamente.
- Las sesiones inválidas deben cerrarse.
- Usuarios desactivados no pueden mantener sesiones activas.

---

# Recuperación de contraseña

El sistema debe permitir recuperación de contraseña usando correo electrónico.

---

## Flujo de recuperación

1. El usuario solicita recuperación.
2. El sistema genera un token temporal.
3. El sistema envía un enlace de recuperación.
4. El usuario define una nueva contraseña.
5. El token queda invalidado.

---

## Reglas de seguridad

- Los tokens deben expirar.
- Los tokens solo pueden usarse una vez.
- Las contraseñas deben almacenarse cifradas.

---

# Gestión de auxiliares

El profesional puede:

- crear auxiliares;
- desactivar auxiliares;
- reactivar auxiliares.

---

## Flujo de creación de auxiliar

1. El profesional crea el auxiliar.
2. El sistema genera credenciales iniciales.
3. El auxiliar inicia sesión.
4. El auxiliar cambia su contraseña.

---

## Desactivación de auxiliares

Cuando un auxiliar deja de trabajar:

- la cuenta puede desactivarse;
- la información del consultorio permanece intacta;
- el historial no se elimina;
- otro auxiliar puede continuar trabajando normalmente.

---

# Validación de permisos

El frontend puede ocultar funcionalidades según el rol.

Sin embargo:

```txt
La validación real siempre debe hacerse en el backend.
```

El backend debe validar:

- autenticación;
- permisos;
- clinic_id;
- ownership de registros.

---

# Buenas prácticas de seguridad

- Las contraseñas deben almacenarse usando hash.
- Nunca almacenar contraseñas en texto plano.
- Validar permisos en cada endpoint.
- Filtrar información por `clinic_id`.
- Evitar exponer IDs sensibles innecesariamente.
- Mantener sesiones seguras.
- Invalidar sesiones expiradas.
- Limitar acceso a funcionalidades críticas.

---

# Tecnologías planeadas

## Autenticación

```txt
Auth.js (NextAuth)
```

---

## Base de datos

```txt
PostgreSQL
```

---

## ORM

```txt
Prisma ORM
```

---

## Backend

```txt
Next.js Fullstack
```

---

# Objetivo final

El sistema de autenticación y permisos debe garantizar:

- seguridad;
- separación de información;
- control de acceso;
- simplicidad de uso;
- mantenibilidad;
- escalabilidad futura.
