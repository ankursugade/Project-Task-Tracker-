"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { EditTaskDialog } from "../project-details/EditTaskDialog";
import { AddTaskDialog } from "../project-details/AddTaskDialog";
import { logStore } from "@/lib/log-store";
import { projectStore, memberStore } from "@/lib/store";

interface MemberTaskSectionProps {
  tasksByProject: { project: Project; tasks: Task[] }[];
  allMembers: Member[];
}

const taskStatuses: TaskStatus[] = ['OPEN', 'WIP', 'CLOSED'];

export function MemberTaskSection({ tasksByProject: initialTasksByProject, allMembers }: MemberTaskSectionProps) {
  const [tasksByProject, setTasksByProject] = useState(initialTasksByProject);
  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(new Set());
  const [projectFilters, setProjectFilters] = useState<Set<string>>(new Set());
  const [isEditTaskOpen, setEditTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [parentForNewSubtask, setParentForNewSubtask] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This effect ensures we are using the latest data from the store on the client side
    const allProjects = projectStore.getProjects();
    const memberId = allMembers[0]?.id; // Assuming we are on a member's page
    if (memberId) {
        const updatedTasksByProject = allProjects.map(project => {
            const tasks = project.tasks.filter(task => task.assignedTo.includes(memberId));
            return { project, tasks };
        }).filter(group => group.tasks.length > 0);
        setTasksByProject(updatedTasksByProject);
    }
    setIsMounted(true);
  }, [allMembers]);

  if (!isMounted) {
    return null; // Or a loading skeleton
  }
  
  const allTasks = tasksByProject.flatMap(p => p.tasks);

  const handleTaskUpdate = (updatedTask: Task, changedById: string) => {
      const projectForTask = projectStore.getProjects().find(p => p.tasks.some(t => t.id === updatedTask.id));
      if (!projectForTask) return;

      let project = { ...projectForTask };
      let newTasks = [...project.tasks];
      const originalTask = newTasks.find(t => t.id === updatedTask.id);

      if (!originalTask) return;

      let finalUpdatedTask = { ...updatedTask };
      const statusChanged = originalTask.status !== finalUpdatedTask.status;

      if (originalTask.status === 'CLOSED' && (finalUpdatedTask.status === 'OPEN' || finalUpdatedTask.status === 'WIP')) {
          finalUpdatedTask.revision = (originalTask.revision || 0) + 1;
      }

      if (finalUpdatedTask.status === 'CLOSED' && finalUpdatedTask.dependencyId) {
          const dependency = allTasks.find(t => t.id === finalUpdatedTask.dependencyId);
          if (dependency && (dependency.status === 'OPEN' || dependency.status === 'WIP')) {
              toast({
                  title: "Action Blocked",
                  description: `Cannot close "${finalUpdatedTask.name}" because it depends on "${dependency.name}", which is not closed.`,
                  variant: "destructive",
              });
              return;
          }
      }
      
      newTasks = newTasks.map(t => t.id === finalUpdatedTask.id ? finalUpdatedTask : t);

      if (!finalUpdatedTask.parentId && finalUpdatedTask.status === 'CLOSED' && originalTask.status !== 'CLOSED') {
          newTasks = newTasks.map(t => {
              if (t.parentId === finalUpdatedTask.id && t.status !== 'CLOSED') {
                   logStore.add({
                      taskId: t.id, taskName: t.name, projectId: project.id, projectName: project.name,
                      previousStatus: t.status, newStatus: 'CLOSED', changedBy: changedById,
                  });
                  return { ...t, status: 'CLOSED' as TaskStatus };
              }
              return t;
          });
      }

      if (originalTask.status === 'CLOSED' && (finalUpdatedTask.status === 'OPEN' || finalUpdatedTask.status === 'WIP')) {
          const dependentTasks = allTasks.filter(t => t.dependencyId === finalUpdatedTask.id);
          dependentTasks.forEach(depTask => {
               if (depTask.status === 'CLOSED') {
                  const depTaskProject = projectStore.getProjects().find(p => p.tasks.some(t => t.id === depTask.id));
                   if (depTaskProject) {
                      const updatedDepProjectTasks = depTaskProject.tasks.map(t => {
                          if (t.id === depTask.id) {
                            logStore.add({
                                taskId: t.id, taskName: t.name, projectId: depTaskProject.id, projectName: depTaskProject.name,
                                previousStatus: 'CLOSED', newStatus: 'OPEN', changedBy: changedById,
                            });
                            const newRevision = (t.revision || 0) + 1;
                            return { ...t, status: 'OPEN' as TaskStatus, revision: newRevision };
                          }
                          return t;
                      });
                      projectStore.updateProject({ ...depTaskProject, tasks: updatedDepProjectTasks });
                   }
               }
          });
      }

      if (statusChanged) {
          logStore.add({
              taskId: originalTask.id, taskName: originalTask.name, projectId: project.id, projectName: project.name,
              previousStatus: originalTask.status, newStatus: finalUpdatedTask.status, changedBy: changedById,
          });
      }
      
      projectStore.updateProject({ ...project, tasks: newTasks });
      // Force a re-render by fetching the latest state from the store
      const memberId = allMembers[0]?.id; // Re-fetch based on current context
      const updatedData = projectStore.getProjects().map(p => ({
          project: p,
          tasks: p.tasks.filter(t => t.assignedTo.includes(memberId))
      })).filter(g => g.tasks.length > 0);
      setTasksByProject(updatedData);

      toast({ title: "Task Updated", description: `Task "${finalUpdatedTask.name}" has been successfully updated.` });
  }; 


  const handleTaskAdd = (newTask: Task) => {
    let finalTask = { ...newTask, revision: 0 };
    
    const projectForTask = projectStore.getProjects().find(p => p.tasks.some(t => t.id === newTask.parentId));
    
    if (!projectForTask) {
        toast({title: "Error", description: "Could not find project for this task.", variant: "destructive"});
        return;
    }

    const projectTasks = projectForTask.tasks;
    const coreTasks = projectTasks.filter(t => !t.parentId);

    if (newTask.parentId) {
      const parentTask = projectTasks.find(t => t.id === newTask.parentId);
      const parentNumberString = parentTask?.name.split('.')[0];
      const parentNumber = parentNumberString ? parseInt(parentNumberString, 10) : coreTasks.length;
      const subTaskCount = projectTasks.filter(t => t.parentId === newTask.parentId).length;
      finalTask.name = `${parentNumber}.${subTaskCount + 1}. ${newTask.name}`;
    } else {
      finalTask.name = `${coreTasks.length + 1}. ${newTask.name}`;
    }

    const updatedTasks = [...projectForTask.tasks, finalTask];
    projectStore.updateProject({ ...projectForTask, tasks: updatedTasks });
    
    const memberId = allMembers[0]?.id;
    const updatedData = projectStore.getProjects().map(p => ({
        project: p,
        tasks: p.tasks.filter(t => t.assignedTo.includes(memberId))
    })).filter(g => g.tasks.length > 0);
    setTasksByProject(updatedData);

    toast({ title: "Task Created", description: `Task "${finalTask.name}" has been successfully added.` });
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setEditTaskOpen(true);
  };

  const handleSubtaskAddClick = (parentId: string) => {
    setParentForNewSubtask(parentId);
    setAddTaskOpen(true);
  };
  
  const handleAddTaskClose = () => {
    setAddTaskOpen(false);
    setParentForNewSubtask(undefined);
  }

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
  
  const filteredProjects = tasksByProject.map(p => {
    const filteredTasks = p.tasks.filter(task => {
        if (statusFilters.size === 0) return true;
        if(task.parentId){
          const parentTask = p.tasks.find(t => t.id === task.parentId);
          if(parentTask && statusFilters.has(parentTask.status)){
            return true;
          }
        }
        return statusFilters.has(task.status);
    });
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
              {initialTasksByProject.map(({ project }) => (
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
                  allTasks={projectStore.getAllTasks()}
                  allMembers={allMembers}
                  onTaskUpdate={handleTaskUpdate}
                  onSubtaskAdd={handleSubtaskAddClick}
                  onEdit={handleEditClick}
                  showProjectName={false}
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

        <AddTaskDialog
            key={parentForNewSubtask}
            isOpen={isAddTaskOpen}
            setIsOpen={handleAddTaskClose}
            onTaskAdd={handleTaskAdd}
            allMembers={allMembers}
            projectTasks={allTasks}
            initialParentId={parentForNewSubtask}
        />

        {taskToEdit && (
            <EditTaskDialog
                isOpen={isEditTaskOpen}
                setIsOpen={setEditTaskOpen}
                onTaskUpdate={handleTaskUpdate}
                allMembers={allMembers}
                projectTasks={allTasks}
                taskToEdit={taskToEdit}
            />
        )}
    </div>
  );
}
