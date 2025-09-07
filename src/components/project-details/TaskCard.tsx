"use client";

import { useEffect, useState } from "react";
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
import { Calendar, User, Users, Briefcase } from "lucide-react";
import type { Task, TaskStatus, Member, Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { highlightDependentTasks } from "@/ai/flows/highlight-dependent-tasks";
import { PROJECTS } from "@/lib/data";

interface TaskCardProps {
  task: Task;
  allTasks: Task[];
  allMembers: Member[];
  onTaskUpdate: (task: Task) => void;
  showProjectName?: boolean;
}

export function TaskCard({ task, allTasks, allMembers, onTaskUpdate, showProjectName = true }: TaskCardProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const assignedMembers = allMembers.filter(m => task.assignedTo.includes(m.id));
  const assigner = allMembers.find(m => m.id === task.assignedBy);

  const project = showProjectName ? PROJECTS.find(p => p.tasks.some(t => t.id === task.id)) : undefined;

  useEffect(() => {
    const checkDependency = async () => {
      if (task.dependencyId) {
        const dependencyTask = allTasks.find(t => t.id === task.dependencyId);
        if (dependencyTask && (dependencyTask.status === "OPEN" || dependencyTask.status === "WIP")) {
          setIsLoading(true);
          try {
            const result = await highlightDependentTasks({
              currentTaskStatus: task.status,
              previousTaskStatus: dependencyTask.status,
            });
            setIsHighlighted(result.shouldHighlight);
          } catch (error) {
            console.error("AI highlighting failed:", error);
            // Fallback logic
            setIsHighlighted(true);
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsHighlighted(false);
        }
      } else {
        setIsHighlighted(false);
      }
    };
    checkDependency();
  }, [task, allTasks]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    onTaskUpdate({ ...task, status: newStatus });
  };
  
  return (
    <Card className={cn("transition-all duration-300", 
        isLoading && "animate-pulse",
        isHighlighted && "bg-orange-50 border-orange-400 ring-2 ring-orange-200 dark:bg-orange-950 dark:border-orange-700 dark:ring-orange-800"
    )}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <CardTitle className="text-xl font-bold font-headline">{task.name}</CardTitle>
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
      </CardContent>
    </Card>
  );
}
