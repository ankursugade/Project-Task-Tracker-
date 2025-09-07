import { notFound } from "next/navigation";
import { PROJECTS, MEMBERS } from "@/lib/data";
import { Header } from "@/components/Header";
import { ProjectDetailHeader } from "@/components/project-details/ProjectDetailHeader";
import { TaskSection } from "@/components/project-details/TaskSection";
import { AppSidebar } from "@/components/AppSidebar";

export async function generateStaticParams() {
  return PROJECTS.map((project) => ({
    id: project.id,
  }));
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const project = PROJECTS.find((p) => p.id === params.id);
  
  if (!project) {
    notFound();
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <div className="mx-auto max-w-6xl">
            <ProjectDetailHeader project={project} />
            <TaskSection initialProject={project} allMembers={MEMBERS} />
          </div>
        </main>
      </div>
    </div>
  );
}
