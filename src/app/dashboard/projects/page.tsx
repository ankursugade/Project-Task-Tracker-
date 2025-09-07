import { Header } from "@/components/Header";
import { ProjectSection } from "@/components/dashboard/ProjectSection";
import { Separator } from "@/components/ui/separator";

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 lg:p-10">
        <ProjectSection />
      </main>
    </div>
  );
}
