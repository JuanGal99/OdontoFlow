import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

import { PrismaClient } from "../lib/generated/prisma/client";
import { AppointmentStatus, UserRole } from "../lib/generated/prisma/enums";

const DEMO_CLINIC_SLUG = "demo-odontoflow";
const DEMO_USERNAME = "demo.pro";
const DEMO_EMAIL = "demo.pro@odontoflow.local";
const DEMO_PASSWORD = "OdontoFlow123!";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const demoPatients = [
  {
    documentType: "CC",
    documentNumber: "1002456789",
    firstName: "Laura",
    lastName: "Martinez Gomez",
    phone: "+57 300 456 7890",
    email: "laura.martinez@example.com",
    notes: "Paciente con sensibilidad dental ocasional. Prefiere citas en la manana.",
  },
  {
    documentType: "CC",
    documentNumber: "79123456",
    firstName: "Carlos",
    lastName: "Rincon Torres",
    phone: "+57 310 222 1045",
    email: "carlos.rincon@example.com",
    notes: "En seguimiento por control periodontal.",
  },
  {
    documentType: "TI",
    documentNumber: "1020304050",
    firstName: "Sofia",
    lastName: "Perez Salazar",
    phone: "+57 315 889 1200",
    email: null,
    notes: "Paciente menor de edad. Acude con acudiente.",
  },
  {
    documentType: "CC",
    documentNumber: "52888777",
    firstName: "Andres",
    lastName: "Castillo Rojas",
    phone: "+57 301 777 3311",
    email: "andres.castillo@example.com",
    notes: "Interesado en plan de blanqueamiento.",
  },
  {
    documentType: "CE",
    documentNumber: "E456789",
    firstName: "Mariana",
    lastName: "Silva Duarte",
    phone: "+57 320 400 9090",
    email: "mariana.silva@example.com",
    notes: "Primera valoracion registrada para demo local.",
  },
];

const demoAppointments = [
  {
    patientDocumentNumber: "1002456789",
    title: "Control de sensibilidad dental",
    startAt: new Date("2026-06-01T14:00:00.000Z"),
    endAt: new Date("2026-06-01T14:45:00.000Z"),
    status: AppointmentStatus.programada,
    notes: "Revisar evolucion y recomendar higiene en casa.",
  },
  {
    patientDocumentNumber: "79123456",
    title: "Control periodontal",
    startAt: new Date("2026-06-01T16:00:00.000Z"),
    endAt: new Date("2026-06-01T17:00:00.000Z"),
    status: AppointmentStatus.programada,
    notes: "Seguimiento de encia y limpieza.",
  },
  {
    patientDocumentNumber: "1020304050",
    title: "Valoracion de ortodoncia",
    startAt: new Date("2026-06-02T15:30:00.000Z"),
    endAt: new Date("2026-06-02T16:15:00.000Z"),
    status: AppointmentStatus.programada,
    notes: "Asiste con acudiente.",
  },
  {
    patientDocumentNumber: "52888777",
    title: "Valoracion para blanqueamiento",
    startAt: new Date("2026-06-03T13:30:00.000Z"),
    endAt: new Date("2026-06-03T14:15:00.000Z"),
    status: AppointmentStatus.programada,
    notes: "Explicar opciones y cuidados posteriores.",
  },
];

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const clinic = await prisma.clinic.upsert({
    where: {
      slug: DEMO_CLINIC_SLUG,
    },
    update: {
      name: "OdontoFlow Demo Clinic",
      isActive: true,
    },
    create: {
      name: "OdontoFlow Demo Clinic",
      slug: DEMO_CLINIC_SLUG,
    },
  });

  const professional = await prisma.user.upsert({
    where: {
      username: DEMO_USERNAME,
    },
    update: {
      clinicId: clinic.id,
      name: "Dra. Valentina Ramirez",
      email: DEMO_EMAIL,
      passwordHash,
      role: UserRole.professional,
      isActive: true,
    },
    create: {
      clinicId: clinic.id,
      username: DEMO_USERNAME,
      name: "Dra. Valentina Ramirez",
      email: DEMO_EMAIL,
      passwordHash,
      role: UserRole.professional,
      isActive: true,
    },
  });

  const patients = await Promise.all(
    demoPatients.map((patient) =>
      prisma.patient.upsert({
        where: {
          clinicId_documentType_documentNumber: {
            clinicId: clinic.id,
            documentType: patient.documentType,
            documentNumber: patient.documentNumber,
          },
        },
        update: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          phone: patient.phone,
          email: patient.email,
          notes: patient.notes,
          isActive: true,
        },
        create: {
          clinicId: clinic.id,
          ...patient,
        },
      }),
    ),
  );

  const patientByDocument = new Map(
    patients.map((patient) => [patient.documentNumber, patient]),
  );

  for (const appointment of demoAppointments) {
    const patient = patientByDocument.get(appointment.patientDocumentNumber);

    if (!patient) {
      throw new Error(
        `Patient ${appointment.patientDocumentNumber} was not seeded.`,
      );
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        clinicId: clinic.id,
        patientId: patient.id,
        title: appointment.title,
        startAt: appointment.startAt,
      },
      select: {
        id: true,
      },
    });

    if (existingAppointment) {
      await prisma.appointment.update({
        where: {
          id: existingAppointment.id,
        },
        data: {
          endAt: appointment.endAt,
          status: appointment.status,
          notes: appointment.notes,
          createdBy: professional.id,
        },
      });

      continue;
    }

    await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        createdBy: professional.id,
        title: appointment.title,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        status: appointment.status,
        notes: appointment.notes,
      },
    });
  }

  const [patientCount, appointmentCount] = await Promise.all([
    prisma.patient.count({
      where: {
        clinicId: clinic.id,
      },
    }),
    prisma.appointment.count({
      where: {
        clinicId: clinic.id,
      },
    }),
  ]);

  console.log("Seed completed:");
  console.log(`- clinic: ${clinic.name} (${clinic.slug})`);
  console.log(`- professional: ${professional.username} / ${DEMO_PASSWORD}`);
  console.log(`- patients in clinic: ${patientCount}`);
  console.log(`- appointments in clinic: ${appointmentCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
