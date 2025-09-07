
import type { Task, Member } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "../shared/StatusBadge";
import { Briefcase, ChevronsUpDown } from "lucide-react";
import { projectStore } from "@/lib/store";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";


interface TaskListProps {
  tasks: Task[];
  allTasks: Task[];
  allMembers: Member[];
  onTaskUpdate: (task: Task, changedById: string) => void;
  onSubtaskAdd: (parentId: string) => void;
  onEdit: (task: Task) => void;
  showProjectName?: boolean;
}

export function TaskList({ tasks, allTasks, allMembers, onTaskUpdate, onSubtaskAdd, onEdit, showProjectName = true }: TaskListProps) {
  const coreTasks = tasks.filter(task => !task.parentId);
  const subTasksByParentId = tasks.reduce((acc, task) => {
    if (task.parentId) {
      if (!acc[task.parentId]) {
        acc[task.parentId] = [];
      }
      acc[task.parentId].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  if (coreTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-card">
        <p className="text-muted-foreground">No tasks match your filters.</p>
        <p className="text-sm text-muted-foreground">Clear filters or add a new task.</p>
      </div>
    );
  }
  
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {coreTasks.map((coreTask) => {
        const subTasks = subTasksByParentId[coreTask.id] || [];
        const hasSubtasks = subTasks.length > 0;
        
        if (!hasSubtasks) {
             return (
                 <TaskCard
                    key={coreTask.id}
                    task={coreTask}
                    allTasks={allTasks}
                    allMembers={allMembers}
                    onTaskUpdate={onTaskUpdate}
                    onSubtaskAdd={onSubtaskAdd}
                    onEdit={onEdit}
                    showProjectName={showProjectName}
                    isSubTask={false}
                 />
            )
        }

        const project = showProjectName ? projectStore.getProjects().find(p => p.tasks.some(t => t.id === coreTask.id)) : undefined;

        const uniqueSubtaskMembers = hasSubtasks 
          ? allMembers.filter(member => 
              new Set(subTasks.flatMap(st => st.assignedTo)).has(member.id)
            )
          : [];

        return (
            <AccordionItem value={coreTask.id} key={coreTask.id} className="border-none">
              <Card className="data-[state=open]:rounded-b-none transition-all">
                 <AccordionTrigger className="p-0 hover:no-underline w-full flex">
                     <CardHeader className="w-full">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                           <CardTitle className="text-xl font-bold pr-10 text-left">{coreTask.name}</CardTitle>
                           <div className="flex items-center gap-2 md:min-w-[120px] justify-end">
                               {project && 
                                 <TooltipProvider>
                                   <Tooltip>
                                     <TooltipTrigger asChild>
                                       <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                         <Briefcase className="h-3 w-3" />
                                         <span>{project.name}</span>
                                       </div>
                                     </TooltipTrigger>
                                     <TooltipContent>Project</TooltipContent>
                                   </Tooltip>
                                 </TooltipProvider>
                               }
                               <StatusBadge status={coreTask.status} />
                               <ChevronsUpDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                           </div>
                        </div>
                        <CardDescription className="text-left">{coreTask.description}</CardDescription>
                     </CardHeader>
                 </AccordionTrigger>
              </Card>
              <AccordionContent className="p-0 rounded-b-lg">
                  <div className="pt-0">
                     <div className="border-t">
                        <TaskCard
                           task={coreTask}
                           allTasks={allTasks}
                           allMembers={allMembers}
                           onTaskUpdate={onTaskUpdate}
                           onSubtaskAdd={onSubtaskAdd}
                           onEdit={onEdit}
                           showProjectName={showProjectName}
                           isSubTask={false}
                           hideDescription={true}
                           overrideAssignedMembers={uniqueSubtaskMembers}
                        />
                     </div>
                     {hasSubtasks && (
                       <div className="pl-8 mt-2 space-y-2 border-l-2 border-dashed ml-7 pb-4">
                         {subTasks.map(subTask => (
                           <TaskCard
                             key={subTask.id}
                             task={subTask}
                             allTasks={allTasks}
                             allMembers={allMembers}
                             onTaskUpdate={onTaskUpdate}
                             onSubtaskAdd={onSubtaskAdd}
                             onEdit={onEdit}
                             showProjectName={showProjectName}
                             isSubTask={true}
                           />
                         ))}
                       </div>
                     )}
                  </div>
              </AccordionContent>
            </AccordionItem>
        )
      })}
    </Accordion>
  );
}
