
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Filter, LayoutGrid, List, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectStore, memberStore } from "@/lib/store";
import type { Project, ProjectStage } from "@/lib/types";
import { ProjectList } from "./ProjectList";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddProjectDialog } from "./AddProjectDialog";
import { MemberCombobox } from "../shared/MemberCombobox";
import { ProjectSummary } from "./ProjectSummary";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import { useToast } from "@/hooks/use-toast";
import { AllProjectsReport } from "./AllProjectsReport";
import { summarizeAllProjects } from "@/ai/flows/summarizeAllProjectsFlow";


const projectStages: ProjectStage[] = ["Pitch", "Design", "Construction", "Handover"];

export function ProjectSection() {
  // Initialize state from the store
  const [projects, setProjects] = useState<Project[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Filters and UI state
  const [stageFilters, setStageFilters] = useState<Set<ProjectStage>>(new Set());
  const [leadFilter, setLeadFilter] = useState<string>("");
  const [captainFilter, setCaptainFilter] = useState<string>("");
  const [isAddProjectOpen, setAddProjectOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const { toast } = useToast();


  // Effect to sync with the client-side store after mounting
  useEffect(() => {
    setProjects(projectStore.getProjects());
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // or a loading skeleton
  }

  const allMembers = memberStore.getMembers();

  const handleStageFilterChange = (stage: ProjectStage) => {
    setStageFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stage)) {
        newSet.delete(stage);
      } else {
        newSet.add(stage);
      }
      return newSet;
    });
  };

  const handleSummaryCardClick = (stage: ProjectStage) => {
    setStageFilters(new Set([stage]));
  };

  const filteredProjects = projects.filter((project) => {
    const stageMatch = stageFilters.size === 0 || stageFilters.has(project.stage);
    const leadMatch = !leadFilter || project.projectLead === leadFilter;
    const captainMatch = !captainFilter || project.designCaptain === captainFilter;
    return stageMatch && leadMatch && captainMatch;
  });

  const clearFilters = () => {
    setStageFilters(new Set());
    setLeadFilter("");
    setCaptainFilter("");
  };

  const handleProjectAdd = (newProject: Project) => {
    projectStore.addProject(newProject);
    setProjects(projectStore.getProjects());
  };
  
  const exportToPDF = async () => {
    setIsPdfLoading(true);
    const reportRoot = document.createElement('div');
    reportRoot.style.position = 'absolute';
    reportRoot.style.left = '-9999px';
    document.body.appendChild(reportRoot);
    const root = createRoot(reportRoot);

    try {
        const projectsForSummary = projects.map(project => {
            const blockedTasks = project.tasks.filter(task => {
                if (!task.dependencyId) return false;
                const dependency = project.tasks.find(d => d.id === task.dependencyId);
                return dependency && (dependency.status === 'OPEN' || dependency.status === 'WIP');
            }).map(task => {
                const dependency = project.tasks.find(d => d.id === task.dependencyId)!;
                const assignedToDependency = allMembers
                    .filter(m => dependency.assignedTo.includes(m.id))
                    .map(m => m.name)
                    .join(", ");
                return `"${task.name}" is blocked by "${dependency.name}" (assigned to: ${assignedToDependency})`;
            });

            return {
                projectName: project.name,
                projectStage: project.stage,
                taskStatuses: project.tasks.map(t => t.status),
                blockedTasks: blockedTasks,
            };
        });

        const aiSummary = await summarizeAllProjects({
            projects: projectsForSummary,
        });

        await new Promise<void>((resolve) => {
          root.render(
            <AllProjectsReport
              projects={projects} 
              allMembers={allMembers}
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
        pdf.save(`all_projects_summary_${new Date().toISOString().split('T')[0]}.pdf`);
        
        toast({ title: "PDF Exported", description: "All projects summary has been downloaded."});
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
    <section>
       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <button onClick={clearFilters} className="text-left hover:opacity-80 transition-opacity">
          <h2 className="text-2xl font-bold tracking-tight">
            Projects Dashboard
          </h2>
        </button>
        <div className="flex items-center gap-2">
          <Button onClick={exportToPDF} disabled={isPdfLoading} variant="outline">
              {isPdfLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              export summary as PDF
          </Button>
           <ToggleGroup type="single" value={view} onValueChange={(value) => {if (value) setView(value as "grid" | "list")}}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Filter by Stage</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projectStages.map((stage) => (
                <DropdownMenuCheckboxItem
                  key={stage}
                  checked={stageFilters.has(stage)}
                  onCheckedChange={() => handleStageFilterChange(stage)}
                >
                  {stage}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <div className="p-2 space-y-2">
                <p className="text-sm font-medium">Project Lead</p>
                <MemberCombobox
                  members={allMembers}
                  selectedMember={leadFilter}
                  setSelectedMember={setLeadFilter}
                  placeholder="Select lead..."
                />
              </div>
              <div className="p-2 space-y-2">
                <p className="text-sm font-medium">Design Captain</p>
                <MemberCombobox
                  members={allMembers}
                  selectedMember={captainFilter}
                  setSelectedMember={setCaptainFilter}
                  placeholder="Select captain..."
                />
              </div>
              <DropdownMenuSeparator />
              <div className="p-1">
                 <Button variant="ghost" className="w-full" onClick={clearFilters}>Clear Filters</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setAddProjectOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      <ProjectSummary projects={projects} onStageClick={handleSummaryCardClick} />

      <ProjectList projects={filteredProjects} view={view} />
      <AddProjectDialog
        isOpen={isAddProjectOpen}
        setIsOpen={setAddProjectOpen}
        onProjectAdd={handleProjectAdd}
        projects={projects}
      />
    </section>
  );
}
