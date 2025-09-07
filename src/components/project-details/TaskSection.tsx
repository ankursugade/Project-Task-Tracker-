"use client";

import { useState } from "react";
import { PlusCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project, Task, Member, TaskStatus } from "@/lib/types";
import { TaskList } from "./TaskList";
import { AddTaskDialog } from "./AddTaskDialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

interface TaskSectionProps {
  initialProject: Project;
  allMembers: Member[];
}

const taskStatuses: TaskStatus[] = ['OPEN', 'WIP', 'CLOSED'];

export function TaskSection({ initialProject, allMembers }: TaskSectionProps) {
  const [project, setProject] = useState(initialProject);
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(new Set());

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
    return statusFilters.size === 0 || statusFilters.has(task.status);
  });

  const handleTaskAdd = (newTask: Task) => {
    setProject((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
    }));
  };

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
                Add Task
            </Button>
        </div>

        <TaskList 
            tasks={filteredTasks} 
            allTasks={project.tasks}
            allMembers={allMembers}
            onTaskUpdate={handleTaskUpdate}
            showProjectName={false}
        />

        <AddTaskDialog
            isOpen={isAddTaskOpen}
            setIsOpen={setAddTaskOpen}
            onTaskAdd={handleTaskAdd}
            allMembers={allMembers}
            projectTasks={project.tasks}
        />
    </div>
  );
}
