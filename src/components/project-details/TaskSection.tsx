
"use client";

import { useState, useEffect, useRef } from "react";
import { PlusCircle, Filter, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project, Task, Member, TaskStatus } from "@/lib/types";
import { TaskList } from "./TaskList";
import { AddTaskDialog } from "./AddTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { DependencyAlert } from "./DependencyAlert";
import { logStore } from "@/lib/log-store";


interface TaskSectionProps {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project | undefined>>;
  allMembers: Member[];
}

const taskStatuses: TaskStatus[] = ['OPEN', 'WIP', 'CLOSED'];

export function TaskSection({ project, setProject, allMembers }: TaskSectionProps) {
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setEditTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [parentForNewSubtask, setParentForNewSubtask] = useState<string | undefined>(undefined);
  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(new Set());
  const { toast } = useToast();
  const prevTasksRef = useRef(project.tasks);

  useEffect(() => {
    if (prevTasksRef.current !== project.tasks) {
      // Logic to find out what changed could be more sophisticated
      // For now, we assume an update toast is fine if lists differ.
      const updatedTask = project.tasks.find(t => 
        prevTasksRef.current.some(pt => pt.id === t.id && pt !== t)
      );

      if (updatedTask) {
        toast({ title: "Task Updated", description: `Task "${updatedTask.name}" has been successfully updated.` });
      }
      prevTasksRef.current = project.tasks;
    }
  }, [project.tasks, toast]);


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

  const filteredTasks = project.tasks.filter((task) => {
    if (statusFilters.size === 0) return true;
    
    if(task.parentId){
      const parentTask = project.tasks.find(t => t.id === task.parentId);
      if(parentTask && statusFilters.has(parentTask.status)){
        return true;
      }
    }
    
    return statusFilters.has(task.status);
  });

  const handleTaskAdd = (newTask: Task) => {
    let finalTask = { ...newTask, revision: 0 };
    const coreTasks = project.tasks.filter(t => !t.parentId);

    if (newTask.parentId) {
      // It's a sub-task
      const parentTask = project.tasks.find(t => t.id === newTask.parentId);
      const parentNumber = coreTasks.findIndex(ct => ct.id === parentTask?.id) + 1;
      const subTaskCount = project.tasks.filter(t => t.parentId === newTask.parentId).length;
      finalTask.name = `${parentNumber}.${subTaskCount + 1}. ${newTask.name}`;
    } else {
      // It's a core task
      finalTask.name = `${coreTasks.length + 1}. ${newTask.name}`;
    }

    setProject((prev) => prev ? ({
      ...prev,
      tasks: [finalTask, ...prev.tasks],
    }) : undefined);
    toast({ title: "Task Created", description: `Task "${finalTask.name}" has been successfully added.` });
  };

  const handleTaskUpdate = (updatedTask: Task, changedById: string) => {
    setProject(prevProject => {
        if (!prevProject) return undefined;

        let newTasks = [...prevProject.tasks];
        const originalTask = newTasks.find(t => t.id === updatedTask.id);

        if (!originalTask) return prevProject;
        
        let finalUpdatedTask = { ...updatedTask };

        const statusChanged = originalTask.status !== finalUpdatedTask.status;

        // Increment revision if a closed task is reopened
        if (originalTask.status === 'CLOSED' && (finalUpdatedTask.status === 'OPEN' || finalUpdatedTask.status === 'WIP')) {
            finalUpdatedTask.revision = (originalTask.revision || 0) + 1;
        }
        
        // New Rule: Prevent closing a core task if sub-tasks are not closed
        if (finalUpdatedTask.status === 'CLOSED' && !finalUpdatedTask.parentId) {
            const subTasks = newTasks.filter(t => t.parentId === finalUpdatedTask.id);
            const openSubTasks = subTasks.filter(st => st.status !== 'CLOSED');
            if (openSubTasks.length > 0) {
                 toast({
                    title: "Action Blocked",
                    description: `Cannot close "${finalUpdatedTask.name}" because ${openSubTasks.length} sub-task(s) are not yet closed.`,
                    variant: "destructive",
                });
                return prevProject; // Abort update
            }
        }


        // Rule 1: Prevent closing a blocked task
        if (finalUpdatedTask.status === 'CLOSED' && finalUpdatedTask.dependencyId) {
            const dependency = newTasks.find(t => t.id === finalUpdatedTask.dependencyId);
            if (dependency && (dependency.status === 'OPEN' || dependency.status === 'WIP')) {
                toast({
                    title: "Action Blocked",
                    description: `Cannot close "${finalUpdatedTask.name}" because it depends on "${dependency.name}", which is not closed.`,
                    variant: "destructive",
                });
                return prevProject; // Abort update
            }
        }
        
        // Update the task itself
        newTasks = newTasks.map(t => t.id === finalUpdatedTask.id ? finalUpdatedTask : t);

        // Rule 2: If a core task is being closed, close all its sub-tasks
        const isCoreTask = !finalUpdatedTask.parentId;
        if (isCoreTask && finalUpdatedTask.status === 'CLOSED' && originalTask.status !== 'CLOSED') {
            newTasks = newTasks.map(t => {
                if (t.parentId === finalUpdatedTask.id && t.status !== 'CLOSED') {
                    logStore.add({
                        taskId: t.id,
                        taskName: t.name,
                        projectId: prevProject.id,
                        projectName: prevProject.name,
                        previousStatus: t.status,
                        newStatus: 'CLOSED',
                        changedBy: changedById,
                    });
                    return { ...t, status: 'CLOSED' as TaskStatus }; // Close sub-tasks
                }
                return t;
            });
        }

        // Rule 3: If a dependency is reopened, reopen dependent tasks
        if (originalTask.status === 'CLOSED' && (finalUpdatedTask.status === 'OPEN' || finalUpdatedTask.status === 'WIP')) {
            const dependentTasks = newTasks.filter(t => t.dependencyId === finalUpdatedTask.id);
            dependentTasks.forEach(depTask => {
                if (depTask.status === 'CLOSED') {
                    newTasks = newTasks.map(t => {
                        if (t.id === depTask.id) {
                            logStore.add({
                                taskId: t.id,
                                taskName: t.name,
                                projectId: prevProject.id,
                                projectName: prevProject.name,
                                previousStatus: 'CLOSED',
                                newStatus: 'OPEN',
                                changedBy: changedById,
                            });
                            const newRevision = (t.revision || 0) + 1;
                            return { ...t, status: 'OPEN' as TaskStatus, revision: newRevision };
                        }
                        return t;
                    });
                }
            });
        }

        if (statusChanged) {
            logStore.add({
                taskId: originalTask.id,
                taskName: originalTask.name,
                projectId: prevProject.id,
                projectName: prevProject.name,
                previousStatus: originalTask.status,
                newStatus: finalUpdatedTask.status,
                changedBy: changedById,
            });
        }
        
        return { ...prevProject, tasks: newTasks };
    });
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

  const exportToCSV = () => {
    const logs = logStore.getLogsForProject(project.id);
    if (logs.length === 0) {
      toast({ title: "No Logs", description: "There are no activities logged for this project yet."});
      return;
    }

    const headers = "Timestamp,Task ID,Task Name,Project ID,Project Name,Previous Status,New Status,Changed By\n";
    const csvContent = logs.map(log => {
      const changedByMember = allMembers.find(m => m.id === log.changedBy)?.name || log.changedBy;
      return [
        log.timestamp.toISOString(),
        `"${log.taskId}"`,
        `"${log.taskName}"`,
        `"${log.projectId}"`,
        `"${log.projectName}"`,
        log.previousStatus || 'None',
        log.newStatus,
        `"${changedByMember}"`
      ].join(',');
    }).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `project_log_${project.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "CSV Exported", description: `Log for project "${project.name}" has been downloaded.` });
  }

  return (
    <div>
      <DependencyAlert allTasks={project.tasks} allMembers={allMembers} />
      <div className="flex items-center justify-end gap-2 mb-6 mt-8">
        <Button variant="outline" onClick={exportToCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
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

            <Button onClick={() => setAddTaskOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Core Task
            </Button>
        </div>

        <TaskList 
            tasks={filteredTasks} 
            allTasks={project.tasks}
            allMembers={allMembers}
            onTaskUpdate={(task, changedById) => handleTaskUpdate(task, changedById)}
            onSubtaskAdd={handleSubtaskAddClick}
            onEdit={handleEditClick}
            showProjectName={false}
        />

        <AddTaskDialog
            key={parentForNewSubtask} // Re-mount when parent changes
            isOpen={isAddTaskOpen}
            setIsOpen={handleAddTaskClose}
            onTaskAdd={handleTaskAdd}
            allMembers={allMembers}
            projectTasks={project.tasks}
            initialParentId={parentForNewSubtask}
        />

        {taskToEdit && (
            <EditTaskDialog
                isOpen={isEditTaskOpen}
                setIsOpen={setEditTaskOpen}
                onTaskUpdate={(task, changedById) => handleTaskUpdate(task, changedById)}
                allMembers={allMembers}
                projectTasks={project.tasks}
                taskToEdit={taskToEdit}
            />
        )}
    </div>
  );
}
