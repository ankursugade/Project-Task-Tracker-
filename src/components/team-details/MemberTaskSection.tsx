"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task, Member, TaskStatus, Project } from "@/lib/types";
import { TaskList } from "@/components/project-details/TaskList";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { ChevronsUpDown } from "lucide-react";

interface MemberTaskSectionProps {
  tasksByProject: { project: Project; tasks: Task[] }[];
  allMembers: Member[];
}

const taskStatuses: TaskStatus[] = ['OPEN', 'WIP', 'CLOSED'];

export function MemberTaskSection({ tasksByProject, allMembers }: MemberTaskSectionProps) {
  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(new Set());
  const [projectFilters, setProjectFilters] = useState<Set<string>>(new Set());
  
  // Note: Task updates are disabled on this page for simplicity. 
  // A more robust solution would involve a global state manager.
  const handleTaskUpdate = () => {}; 

  const handleStatusFilterChange = (status: TaskStatus) => {
    setStatusFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  const handleProjectFilterChange = (projectId: string) => {
    setProjectFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };
  
  const allTasks = tasksByProject.flatMap(p => p.tasks);

  const filteredProjects = tasksByProject.map(p => {
    const filteredTasks = p.tasks.filter(task => 
      statusFilters.size === 0 || statusFilters.has(task.status)
    );
    return { ...p, tasks: filteredTasks };
  }).filter(p => {
    const projectMatch = projectFilters.size === 0 || projectFilters.has(p.project.id);
    return projectMatch && p.tasks.length > 0;
  });


  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-6">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter Project
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tasksByProject.map(({ project }) => (
                <DropdownMenuCheckboxItem
                  key={project.id}
                  checked={projectFilters.has(project.id)}
                  onCheckedChange={() => handleProjectFilterChange(project.id)}
                >
                  {project.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {taskStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilters.has(status)}
                  onCheckedChange={() => handleStatusFilterChange(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
      </div>

      {filteredProjects.length > 0 ? (
        <Accordion type="multiple" defaultValue={filteredProjects.map(p => p.project.id)} className="w-full space-y-4">
          {filteredProjects.map(({ project, tasks }) => (
            <AccordionItem value={project.id} key={project.id} className="border rounded-lg bg-card">
              <AccordionTrigger className="p-4 hover:no-underline">
                 <div className="flex items-center justify-between w-full">
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                      <h3 className="text-xl font-bold font-headline">{project.name}</h3>
                    </Link>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                 </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <TaskList
                  tasks={tasks}
                  allTasks={allTasks}
                  allMembers={allMembers}
                  onTaskUpdate={handleTaskUpdate}
                  showProjectName={false} // Don't need to show project name here
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-card">
            <p className="text-muted-foreground">No tasks match your filters.</p>
            <p className="text-sm text-muted-foreground">Try clearing the status or project filter.</p>
        </div>
      )}
    </div>
  );
}
