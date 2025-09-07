
"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { PROJECTS, MEMBERS } from "@/lib/data";
import { Header } from "@/components/Header";
import { ProjectDetailHeader } from "@/components/project-details/ProjectDetailHeader";
import { TaskSection } from "@/components/project-details/TaskSection";
import { AppSidebar } from "@/components/AppSidebar";
import type { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { summarizeProject } from "@/ai/flows/summarizeProjectFlow";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ProjectReport } from "@/components/project-details/ProjectReport";
import { createRoot } from "react-dom/client";

// This page needs to be a client component to manage state, but we can't fetch data directly in a client component's main body.
// A common pattern is to have a parent Server Component fetch the data and pass it to a child Client Component.
// For this case, we'll use a simplified approach since we have static data.
// In a real app, you'd fetch this in a parent component or use a library like SWR/React Query.

export default function ProjectPage({ params }: { params: { id: string } }) {
  const initialProject = PROJECTS.find((p) => p.id === params.id);
  const [project, setProject] = useState<Project | undefined>(initialProject);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const { toast } = useToast();
  
  if (!project) {
    // We can call notFound() directly if the component is simple.
    // If it had hooks before the check, we'd need to render null and handle it.
    notFound();
  }

  const exportToPDF = async () => {
    if (!project) return;
    setIsPdfLoading(true);
    const reportRoot = document.createElement('div');
    reportRoot.style.position = 'absolute';
    reportRoot.style.left = '-9999px';
    document.body.appendChild(reportRoot);
    const root = createRoot(reportRoot);

    try {
        const blockedTasks = project.tasks.filter(task => {
            if (!task.dependencyId) return false;
            const dependency = project.tasks.find(d => d.id === task.dependencyId);
            return dependency && (dependency.status === 'OPEN' || dependency.status === 'WIP');
        }).map(task => {
            const dependency = project.tasks.find(d => d.id === task.dependencyId)!;
            const assignedToDependency = MEMBERS
                .filter(m => dependency.assignedTo.includes(m.id))
                .map(m => m.name)
                .join(", ");
            return `"${task.name}" is blocked by "${dependency.name}" (assigned to: ${assignedToDependency})`;
        });

        const taskStatuses = project.tasks.map(t => t.status);

        const aiSummary = await summarizeProject({
            projectName: project.name,
            projectStage: project.stage,
            taskStatuses: taskStatuses,
            blockedTasks: blockedTasks,
        });

        await new Promise<void>((resolve) => {
          root.render(
            <ProjectReport 
              project={project} 
              allMembers={MEMBERS}
              aiSummary={aiSummary} 
              onRendered={() => resolve()}
            />
          );
        });

        const reportElement = reportRoot.children[0] as HTMLElement;
        const canvas = await html2canvas(reportElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`project_summary_${project.name.replace(/\s+/g, '_')}.pdf`);
        
        toast({ title: "PDF Exported", description: "Project summary has been downloaded."});
    } catch(e) {
        console.error("PDF Export Error: ", e);
        toast({ title: "Export Failed", description: "Could not generate PDF report.", variant: "destructive"});
    } finally {
        root.unmount();
        document.body.removeChild(reportRoot);
        setIsPdfLoading(false);
    }
  }


  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <div className="mx-auto max-w-6xl">
            <ProjectDetailHeader 
                project={project} 
                onExportPDF={exportToPDF}
                isPdfLoading={isPdfLoading}
            />
            <TaskSection 
                project={project}
                setProject={setProject} 
                allMembers={MEMBERS} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
