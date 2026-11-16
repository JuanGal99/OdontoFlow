import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { ImagesModule } from "@/components/clinical-images/images-module";
import { listImagesAction } from "@/lib/clinical-images/actions";
import { listPatientsAction } from "@/lib/patients/actions";
import { listTreatmentsAction } from "@/lib/treatments/actions";
import { getAuthenticatedSessionContext } from "@/lib/auth/session";

export default async function ImagesPage() {
  try {
    await getAuthenticatedSessionContext();
  } catch {
    redirect("/login");
  }

  const [imagesResult, patientsResult, treatmentsResult] = await Promise.all([
    listImagesAction(),
    listPatientsAction({ pageSize: 500 }),
    listTreatmentsAction(),
  ]);

  const patients = patientsResult.ok ? patientsResult.data.patients : [];
  const treatments = treatmentsResult.ok ? treatmentsResult.data : [];

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeHref="/images" />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <ImagesModule
            result={imagesResult}
            patients={patients}
            treatments={treatments}
          />
        </div>
      </main>
    </div>
  );
}
