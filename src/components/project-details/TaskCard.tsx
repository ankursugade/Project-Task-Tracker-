"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "../shared/StatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, User, Users, Briefcase, GitCommitHorizontal, MessageSquarePlus } from "lucide-react";
import type { Task, TaskStatus, Member } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PROJECTS } from "@/lib/data";
import { Button } from "../ui/button";

interface TaskCardProps {
  task: Task;
  allTasks: Task[];
  allMembers: Member[];
  onTaskUpdate: (task: Task) => void;
  onTaskAdd: (task: Task) => void;
  showProjectName?: boolean;
  isCoreTask?: boolean;
  subtaskCount?: number;
  children?: React.ReactNode;
}

export function TaskCard({ task, allTasks, allMembers, onTaskUpdate, onTaskAdd, showProjectName = true, isCoreTask, subtaskCount, children }: TaskCardProps) {
  const assignedMembers = allMembers.filter(m => task.assignedTo.includes(m.id));
  const assigner = allMembers.find(m => m.id === task.assignedBy);

  const project = showProjectName ? PROJECTS.find(p => p.tasks.some(t => t.id === task.id)) : undefined;

  const dependencyTask = task.dependencyId ? allTasks.find(t => t.id === task.dependencyId) : undefined;
  const isHighlighted = dependencyTask && (dependencyTask.status === "OPEN" || dependencyTask.status === "WIP");

  const handleStatusChange = (newStatus: TaskStatus) => {
    onTaskUpdate({ ...task, status: newStatus });
  };
  
  const handleAddSubtask = () => {
    // A simplified sub-task, ideally this would open the full AddTaskDialog with pre-filled parent
     const newSubtask: Task = {
      id: `task-${Date.now()}`,
      name: `New sub-task for ${task.name}`,
      description: "",
      status: "OPEN",
      startDate: new Date(),
      endDate: new Date(),
      assignedTo: [],
      assignedBy: "mem-1", // Placeholder
      parentId: task.id,
    };
    onTaskAdd(newSubtask);
  }

  return (
    <Card className={cn("transition-all duration-300 relative", 
        isHighlighted && "bg-orange-50 border-orange-400 ring-2 ring-orange-200 dark:bg-orange-950 dark:border-orange-700 dark:ring-orange-800"
    )}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <CardTitle className="text-xl font-bold font-headline pr-10">{task.name}</CardTitle>
            <div className="flex items-center gap-2 md:min-w-[120px] justify-end">
                {project && 
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Briefcase className="h-3 w-3" />
                          <span>{project.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Project</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                }
                <StatusBadge status={task.status} />
            </div>
        </div>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4"/>
                <span>{task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}</span>
            </div>
            {assigner && 
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Assigned by {assigner.name}</span>
              </div>
            }
             {isCoreTask && subtaskCount !== undefined && (
              <div className="flex items-center gap-2">
                <GitCommitHorizontal className="h-4 w-4" />
                <span>{subtaskCount} sub-tasks</span>
              </div>
            )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground"/>
                <div className="flex -space-x-2">
                {assignedMembers.map(member => (
                    <TooltipProvider key={member.id}>
                        <Tooltip>
                            <TooltipTrigger>
                                <Avatar className="h-8 w-8 border-2 border-card">
                                    <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person face" />
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>{member.name}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
                </div>
            </div>
            <div className="flex items-center gap-2">
               {isCoreTask && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleAddSubtask}><MessageSquarePlus className="h-4 w-4" /></Button>
                        </TooltipTrigger>
                        <TooltipContent>Add sub-task</TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
                )}
                <div className="w-full md:w-auto">
                    <Select onValueChange={handleStatusChange} value={task.status}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="WIP">In Progress</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
