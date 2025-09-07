"use client";

import { useState } from "react";
import { PlusCircle, Filter, FileDown, Loader2, FileText } from "lucide-react";
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
import { summarizeProject } from "@/ai/flows/summarizeProjectFlow";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ProjectReport } from "./ProjectReport";
import { createRoot } from "react-dom/client";

interface TaskSectionProps {
  initialProject: Project;
  allMembers: Member[];
}

const taskStatuses: TaskStatus[] = ['OPEN', 'WIP', 'CLOSED'];

export function TaskSection({ initialProject, allMembers }: TaskSectionProps) {
  const [project, setProject] = useState(initialProject);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setEditTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [parentForNewSubtask, setParentForNewSubtask] = useState<string | undefined>(undefined);
  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(new Set());
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const { toast } = useToast();


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

    setProject((prev) => ({
      ...prev,
      tasks: [finalTask, ...prev.tasks],
    }));
    toast({ title: "Task Created", description: `Task "${finalTask.name}" has been successfully added.` });
  };

  const handleTaskUpdate = (updatedTask: Task, changedById: string) => {
    let newTasks = [...project.tasks];
    const originalTask = newTasks.find(t => t.id === updatedTask.id);

    if (!originalTask) return;
    
    let finalUpdatedTask = { ...updatedTask };

    const statusChanged = originalTask.status !== finalUpdatedTask.status;

    // Increment revision if a closed task is reopened
    if (originalTask.status === 'CLOSED' && (finalUpdatedTask.status === 'OPEN' || finalUpdatedTask.status === 'WIP')) {
        finalUpdatedTask.revision = (originalTask.revision || 0) + 1;
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
            return; // Abort update
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
                    projectId: project.id,
                    projectName: project.name,
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
                            projectId: project.id,
                            projectName: project.name,
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
            projectId: project.id,
            projectName: project.name,
            previousStatus: originalTask.status,
            newStatus: finalUpdatedTask.status,
            changedBy: changedById,
        });
    }

    setProject(prev => ({ ...prev, tasks: newTasks }));

    toast({ title: "Task Updated", description: `Task "${finalUpdatedTask.name}" has been successfully updated.` });
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

  const exportToPDF = async () => {
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
            const assignedToDependency = allMembers
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
    <div>
      <DependencyAlert allTasks={project.tasks} allMembers={allMembers} />
      <div className="flex items-center justify-end gap-2 mb-6">
        <Button variant="outline" onClick={exportToPDF} disabled={isPdfLoading}>
            {isPdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <FileText className="mr-2 h-4 w-4" />
            )}
            Export PDF
        </Button>
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
