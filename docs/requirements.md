# Requerimientos - OdontoFlow

## Descripción general

OdontoFlow es una plataforma web privada para la gestión operativa de consultorios odontológicos independientes.

El sistema permite que diferentes consultorios usen la misma plataforma sin mezclar información entre ellos. Cada consultorio tiene sus propios usuarios, pacientes, citas, tratamientos, imágenes clínicas y movimientos financieros.

---

## Roles del sistema

### Profesional

Usuario principal del consultorio.

Puede:

- gestionar su consultorio;
- crear y desactivar auxiliares;
- gestionar pacientes;
- gestionar citas;
- gestionar tratamientos;
- registrar ingresos, egresos y compras;
- subir imágenes clínicas;
- consultar reportes básicos.

### Auxiliar

Usuario operativo opcional del consultorio.

Puede:

- consultar pacientes;
- registrar pacientes;
- editar información básica de pacientes;
- crear y editar citas;
- cancelar citas;
- registrar movimientos básicos permitidos.

No puede:

- administrar usuarios;
- eliminar información crítica;
- acceder a configuración avanzada del consultorio.

---

## Requerimientos funcionales

### Autenticación

| Código | Requerimiento                                                                     |
| ------ | --------------------------------------------------------------------------------- |
| RF-01  | El sistema debe permitir el registro de un profesional.                           |
| RF-02  | El sistema debe crear automáticamente un consultorio al registrar un profesional. |
| RF-03  | El sistema debe permitir iniciar sesión con usuario y contraseña.                 |
| RF-04  | El sistema debe permitir cerrar sesión.                                           |
| RF-05  | El sistema debe permitir recuperar contraseña usando el correo electrónico.       |
| RF-06  | El sistema debe proteger las rutas privadas.                                      |

---

### Consultorios

| Código | Requerimiento                                                                   |
| ------ | ------------------------------------------------------------------------------- |
| RF-07  | Cada consultorio debe tener su información aislada.                             |
| RF-08  | El profesional debe poder editar el nombre de su consultorio.                   |
| RF-09  | Un usuario solo debe acceder a la información del consultorio al que pertenece. |

---

### Usuarios

| Código | Requerimiento                                                |
| ------ | ------------------------------------------------------------ |
| RF-10  | El profesional debe poder crear auxiliares.                  |
| RF-11  | El profesional debe poder desactivar auxiliares.             |
| RF-12  | El auxiliar debe acceder con sus propias credenciales.       |
| RF-13  | El auxiliar no debe compartir contraseña con el profesional. |

---

### Pacientes

| Código | Requerimiento                                                                  |
| ------ | ------------------------------------------------------------------------------ |
| RF-14  | El sistema debe permitir crear pacientes.                                      |
| RF-15  | El sistema debe permitir buscar pacientes.                                     |
| RF-16  | El sistema debe permitir ver el listado de pacientes.                          |
| RF-17  | El sistema debe permitir ver el detalle de un paciente.                        |
| RF-18  | El sistema debe permitir editar pacientes.                                     |
| RF-19  | El profesional puede eliminar o desactivar pacientes según reglas del sistema. |

---

### Citas

| Código | Requerimiento                                           |
| ------ | ------------------------------------------------------- |
| RF-20  | El sistema debe permitir crear citas.                   |
| RF-21  | El sistema debe permitir editar citas.                  |
| RF-22  | El sistema debe permitir cancelar citas.                |
| RF-23  | El sistema debe permitir ver la agenda del consultorio. |
| RF-24  | El sistema debe permitir marcar asistencia de una cita. |

Estados de cita:

- Programada
- Cancelada
- Asistió
- No asistió

---

### Tratamientos

| Código | Requerimiento                                                                   |
| ------ | ------------------------------------------------------------------------------- |
| RF-25  | El sistema debe permitir crear tratamientos.                                    |
| RF-26  | El sistema debe permitir asociar tratamientos a pacientes.                      |
| RF-27  | El sistema debe permitir actualizar el estado de un tratamiento.                |
| RF-28  | El sistema debe permitir agregar observaciones a un tratamiento.                |
| RF-29  | El sistema debe permitir consultar el historial de tratamientos de un paciente. |

Estados de tratamiento:

- Planificado
- En proceso
- Finalizado
- Cancelado

---

### Imágenes clínicas

| Código | Requerimiento                                                       |
| ------ | ------------------------------------------------------------------- |
| RF-30  | El sistema debe permitir subir imágenes clínicas de forma opcional. |
| RF-31  | Las imágenes pueden asociarse a pacientes o tratamientos.           |
| RF-32  | Las imágenes deben almacenarse en Cloudinary.                       |
| RF-33  | El sistema debe guardar la URL de la imagen en la base de datos.    |

---

### Finanzas

| Código | Requerimiento                                                    |
| ------ | ---------------------------------------------------------------- |
| RF-34  | El sistema debe permitir registrar ingresos.                     |
| RF-35  | El sistema debe permitir registrar egresos.                      |
| RF-36  | El sistema debe permitir registrar compras del consultorio.      |
| RF-37  | El sistema debe permitir consultar un resumen financiero básico. |

---

## Requerimientos no funcionales

| Código | Requerimiento                                                             |
| ------ | ------------------------------------------------------------------------- |
| RNF-01 | El sistema debe ser responsive para PC y tablet.                          |
| RNF-02 | El sistema debe tener una interfaz moderna, minimalista y clara.          |
| RNF-03 | La información de cada consultorio debe permanecer aislada.               |
| RNF-04 | Las contraseñas deben almacenarse cifradas.                               |
| RNF-05 | El sistema debe validar permisos según el rol del usuario.                |
| RNF-06 | El sistema debe evitar que un usuario acceda a datos de otro consultorio. |
| RNF-07 | El sistema debe ser mantenible y estar organizado por módulos.            |
