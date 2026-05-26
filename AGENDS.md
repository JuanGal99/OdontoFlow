# AGENTS.md

## Project overview

OdontoFlow is a private SaaS platform for managing small independent dental practices.

The application must support multiple independent practices using the same codebase and database without mixing their data.

The product is intended for:

- independent dentists;
- small dental offices;
- dental professionals working with an optional assistant.

The goal is to build a clean, modern and maintainable MVP, not an overcomplicated enterprise medical system.

---

## Tech stack

Use the following stack:

- Next.js fullstack
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- Auth.js
- Cloudinary for optional clinical images

Do not introduce additional major technologies unless clearly necessary.

---

## Architecture rules

The application follows a multi-tenant model.

Every operational record must belong to a clinic through `clinic_id`.

This applies to:

- users;
- patients;
- appointments;
- treatments;
- clinical images;
- income records;
- expense records;
- purchases.

Every server-side query must validate the authenticated user's `clinic_id`.

Never allow a user from one clinic to access, update or delete data from another clinic.

Frontend checks are not enough. Data isolation must always be enforced server-side.

---

## Roles

The system has two roles:

```txt
professional
auxiliary
```

### professional

The professional is the main user of the clinic.

The professional can:

- manage patients;
- manage appointments;
- manage treatments;
- upload clinical images;
- register income, expenses and purchases;
- manage auxiliary users;
- edit basic clinic information.

### auxiliary

The auxiliary is an optional operational user.

The auxiliary can:

- view and search patients;
- create patients;
- edit basic patient information;
- manage appointments;
- register basic financial movements if allowed.

The auxiliary cannot:

- manage users;
- edit clinic configuration;
- delete critical information;
- access advanced administrative actions.

---

## Product scope

Prioritize the MVP.

The MVP includes:

- professional registration;
- automatic clinic creation;
- login and logout;
- protected private routes;
- auxiliary user management;
- patient management;
- appointment management;
- treatment management;
- optional clinical images;
- basic income, expense and purchase records.

Do not implement yet:

- online payments;
- electronic invoicing;
- artificial intelligence;
- advanced inventory;
- complex notifications;
- patient portal;
- microservices;
- large clinical record systems.

---

## UI and UX guidelines

The interface should feel like a modern SaaS product.

Visual direction:

- clean;
- minimal;
- clear;
- fast;
- professional;
- desktop-first;
- tablet-friendly.

Inspiration:

```txt
Linear
Stripe
Notion
```

Avoid:

- cluttered screens;
- excessive colors;
- overloaded dashboards;
- very long forms;
- unnecessary configuration;
- complex workflows for simple actions.

The user should be able to understand the main actions quickly.

---

## Code guidelines

Use TypeScript strictly.

Avoid:

```txt
any
```

Prefer:

- explicit types;
- reusable components;
- clear function names;
- small files when possible;
- server-side validation;
- consistent naming.

Keep business logic out of UI components when possible.

Reusable UI components should go in:

```txt
components/
```

Shared utilities should go in:

```txt
lib/
```

Database models and migrations should go in:

```txt
prisma/
```

Documentation should go in:

```txt
docs/
```

---

## Security rules

Always enforce:

- authenticated access to private routes;
- role-based permissions;
- clinic-based data isolation;
- password hashing;
- session validation;
- server-side authorization.

Never expose:

- environment variables;
- database credentials;
- Cloudinary secrets;
- Auth secrets;
- real patient data.

Use `.env.example` only for documenting required variable names.

---

## Database rules

Use UUIDs for main entity IDs.

Use timestamps on important entities:

```txt
created_at
updated_at
```

Use soft delete or deactivation when appropriate, especially for users and sensitive records.

Avoid hard deleting critical data unless explicitly required.

Clinical images are optional and must be stored in Cloudinary.

The database should only store the image URL and metadata.

---

## Naming conventions

Use English for code, files, database models and variables.

Examples:

```txt
Patient
Appointment
Treatment
ClinicalImage
clinic_id
created_at
updated_at
```

The user-facing interface may be in Spanish.

---

## Documentation

Before implementing large features, check the files inside:

```txt
docs/
```

Important documentation includes:

- requirements.md
- database-design.md
- auth-and-permissions.md
- roadmap.md
- diagrams/

Keep implementation aligned with the documented MVP and permissions.

---

## Development philosophy

Follow this priority order:

```txt
simple > complex
usable > perfect
clear > large
maintainable > clever
```

Do not over-engineer the MVP.

When adding a feature, prefer the smallest complete implementation that respects:

- multi-tenant isolation;
- permissions;
- maintainability;
- clean UX.
