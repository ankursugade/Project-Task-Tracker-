"use client";

import { useState } from "react";
import { PlusCircle, Filter, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, MEMBERS } from "@/lib/data";
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

const projectStages: ProjectStage[] = ["Pitch", "Design", "Construction", "Handover"];

export function ProjectSection() {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [stageFilters, setStageFilters] = useState<Set<ProjectStage>>(new Set());
  const [leadFilter, setLeadFilter] = useState<string>("");
  const [captainFilter, setCaptainFilter] = useState<string>("");
  const [isAddProjectOpen, setAddProjectOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");


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

  return (
    <section>
       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <button onClick={clearFilters} className="text-left hover:opacity-80 transition-opacity">
          <h2 className="text-2xl font-bold tracking-tight font-headline">
            Projects Dashboard
          </h2>
        </button>
        <div className="flex items-center gap-2">
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
                Filter Projects
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
                  members={MEMBERS}
                  selectedMember={leadFilter}
                  setSelectedMember={setLeadFilter}
                  placeholder="Select lead..."
                />
              </div>
              <div className="p-2 space-y-2">
                <p className="text-sm font-medium">Design Captain</p>
                <MemberCombobox
                  members={MEMBERS}
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
        onProjectAdd={(newProject) => setProjects((p) => [newProject, ...p])}
      />
    </section>
  );
}
