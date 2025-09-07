"use client";

import { useState } from "react";
import { PlusCircle, Filter } from "lucide-react";
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
    setProject((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    toast({ title: "Task Created", description: `Task "${newTask.name}" has been successfully added.` });
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
    }));
    toast({ title: "Task Updated", description: `Task "${updatedTask.name}" has been successfully updated.` });
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

  return (
    <div>
        <div className="flex items-center justify-end gap-2 mb-6">
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
            onTaskUpdate={handleTaskUpdate}
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
                onTaskUpdate={handleTaskUpdate}
                allMembers={allMembers}
                projectTasks={project.tasks}
                taskToEdit={taskToEdit}
            />
        )}
    </div>
  );
}
