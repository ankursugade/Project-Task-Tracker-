
"use client";

import { useState } from 'react';
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
import { Calendar, User, Users, Briefcase, GitCommitHorizontal, MessageSquarePlus, Pencil, Link2, GitBranch, ChevronsUpDown } from "lucide-react";
import type { Task, TaskStatus, Member } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PROJECTS } from "@/lib/data";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { MemberCombobox } from '../shared/MemberCombobox';

interface TaskCardProps {
  task: Task;
  allTasks: Task[];
  allMembers: Member[];
  onTaskUpdate: (task: Task, changedById: string) => void;
  onSubtaskAdd: (parentId: string) => void;
  onEdit: (task: Task) => void;
  showProjectName?: boolean;
  isSubTask?: boolean;
  isAccordionTrigger?: boolean;
  hideDescription?: boolean;
}

export function TaskCard({ task, allTasks, allMembers, onTaskUpdate, onSubtaskAdd, onEdit, showProjectName = true, isSubTask = false, isAccordionTrigger = false, hideDescription = false }: TaskCardProps) {
  const [changedBy, setChangedBy] = useState("");
  const assignedMembers = allMembers.filter(m => task.assignedTo.includes(m.id));
  const assigner = allMembers.find(m => m.id === task.assignedBy);

  const project = showProjectName ? PROJECTS.find(p => p.tasks.some(t => t.id === task.id)) : undefined;

  const dependencyTask = task.dependencyId ? allTasks.find(t => t.id === task.dependencyId) : undefined;
  const isBlocked = dependencyTask && (dependencyTask.status === "OPEN" || dependencyTask.status === "WIP");

  const dependentTasks = allTasks.filter(t => t.dependencyId === task.id);
  const isBlocking = dependentTasks.length > 0 && task.status !== 'CLOSED';

  const subtaskCount = allTasks.filter(t => t.parentId === task.id).length;

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!changedBy) {
        alert("Please select who is changing the status.");
        return;
    }
    onTaskUpdate({ ...task, status: newStatus }, changedBy);
  };
  
  return (
     <Card className={cn("transition-all duration-300 w-full group", 
        isBlocked && "bg-orange-50 border-orange-400 ring-2 ring-orange-200 dark:bg-orange-950 dark:border-orange-700 dark:ring-orange-800",
        isBlocking && "bg-purple-50 border-purple-400 ring-2 ring-purple-200 dark:bg-purple-950 dark:border-purple-700 dark:ring-purple-800"
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
                  {isAccordionTrigger && <ChevronsUpDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />}
              </div>
          </div>
          {!hideDescription && <CardDescription>{task.description}</CardDescription>}
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
              {!isSubTask && subtaskCount > 0 && (
                <div className="flex items-center gap-2">
                  <GitCommitHorizontal className="h-4 w-4" />
                  <span>{subtaskCount} sub-tasks</span>
                </div>
              )}
              {dependencyTask && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4"/>
                          <span>Depends on "{dependencyTask.name}"</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Dependency Status: <StatusBadge status={dependencyTask.status} />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
          </div>
          
          {isBlocking && (
              <div className="text-xs text-purple-800 dark:text-purple-300">
                  <div className="flex items-center gap-2 font-semibold">
                      <GitBranch className="h-3 w-3" />
                      <span>Blocking:</span>
                  </div>
                  <ul className="pl-5 list-disc list-inside">
                      {dependentTasks.map(depTask => <li key={depTask.id}>{depTask.name}</li>)}
                  </ul>
              </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground"/>
                  <div className="flex items-center gap-2 flex-wrap">
                  {assignedMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-1.5">
                          <Avatar className="h-6 w-6 border-2 border-card">
                              <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person face" />
                              <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{member.name}</span>
                      </div>
                  ))}
                  </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                {!isSubTask && (
                  <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => onSubtaskAdd(task.id)}><MessageSquarePlus className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent>Add sub-task</TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onEdit(task)}><Pencil className="h-4 w-4" /></Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit task</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Popover>
                          <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">Changed by: {allMembers.find(m=>m.id===changedBy)?.name || "Select..."}</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                              <div className="p-2">
                                  <Label className="text-xs px-1">Who is changing status?</Label>
                                  <MemberCombobox members={allMembers} selectedMember={changedBy} setSelectedMember={setChangedBy} />
                              </div>
                          </PopoverContent>
                      </Popover>
                      <Select onValueChange={handleStatusChange} value={task.status}>
                          <SelectTrigger className="w-full md:w-[150px]">
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
        </CardContent>
    </Card>
  );
}
