import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  activePatients: number;
  todayAppointments: number;
  activeTreatments: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
};

export type TodayAppointment = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  patient: { firstName: string; lastName: string };
};

export type RecentPatient = {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
};

export type DashboardData = {
  stats: DashboardStats;
  todayAppointments: TodayAppointment[];
  recentPatients: RecentPatient[];
};

export async function getDashboardData(clinicId: string): Promise<DashboardData> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    activePatients,
    todayAppointmentCount,
    activeTreatments,
    incomeAgg,
    expenseAgg,
    todayAppointments,
    recentPatients,
  ] = await prisma.$transaction([
    prisma.patient.count({
      where: { clinicId, isActive: true },
    }),
    prisma.appointment.count({
      where: { clinicId, startAt: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.treatment.count({
      where: { clinicId, status: { in: ["planificado", "en_proceso"] } },
    }),
    prisma.income.aggregate({
      where: { clinicId, date: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { clinicId, date: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.appointment.findMany({
      where: { clinicId, startAt: { gte: todayStart, lt: todayEnd } },
      orderBy: { startAt: "asc" },
      take: 10,
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true,
        status: true,
        patient: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.patient.findMany({
      where: { clinicId, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    }),
  ]);

  const monthlyIncome = Number(incomeAgg._sum.amount ?? 0);
  const monthlyExpenses = Number(expenseAgg._sum.amount ?? 0);

  return {
    stats: {
      activePatients,
      todayAppointments: todayAppointmentCount,
      activeTreatments,
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance: monthlyIncome - monthlyExpenses,
    },
    todayAppointments: todayAppointments.map((a) => ({
      ...a,
      startAt: a.startAt.toISOString(),
      endAt: a.endAt.toISOString(),
    })),
    recentPatients: recentPatients.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
  };
}
