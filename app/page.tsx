import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, UsersRound } from "lucide-react";

const features = [
  {
    title: "Agenda clara",
    description: "Una vista simple para organizar citas y flujo diario.",
    icon: CalendarDays,
  },
  {
    title: "Pacientes ordenados",
    description: "Base preparada para centralizar informacion clinica basica.",
    icon: UsersRound,
  },
  {
    title: "Consultorios separados",
    description: "Disenado para mantener cada consultorio como espacio privado.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            OF
          </span>
          <span className="text-sm font-semibold">OdontoFlow</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Crear cuenta
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            SaaS privado para consultorios odontologicos
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Gestion simple para consultorios dentales independientes.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            OdontoFlow prepara una experiencia limpia para administrar pacientes,
            agenda, tratamientos e informacion operativa sin sobrecargar el dia a
            dia del profesional.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Crear consultorio
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#foundation"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              Explorar base UI
            </Link>
          </div>
        </div>

        <div className="rounded-md border bg-muted/20 p-3 shadow-sm">
          <div className="rounded-md border bg-background">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-medium">Consultorio Demo</p>
                <p className="text-xs text-muted-foreground">Semana actual</p>
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                Placeholder
              </span>
            </div>
            <div className="grid gap-3 p-4">
              {["Paciente nuevo", "Control de ortodoncia", "Limpieza dental"].map(
                (item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item}</p>
                      <p className="text-xs text-muted-foreground">
                        {9 + index}:00 AM
                      </p>
                    </div>
                    <span className="size-2 rounded-full bg-primary" />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="foundation"
        className="border-t bg-muted/20 px-4 py-14 sm:px-6"
      >
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-md border bg-background p-5"
            >
              <feature.icon className="size-5 text-muted-foreground" />
              <h2 className="mt-5 text-base font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
