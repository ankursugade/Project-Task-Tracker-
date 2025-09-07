import type { Task, Member } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronsUpDown } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  allTasks: Task[];
  allMembers: Member[];
  onTaskUpdate: (task: Task) => void;
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
    <Accordion type="multiple" className="w-full space-y-4">
      {coreTasks.map((coreTask) => {
        const subTasks = subTasksByParentId[coreTask.id] || [];
        return (
          <AccordionItem value={coreTask.id} key={coreTask.id} className="border-none">
             <TaskCard
              task={coreTask}
              allTasks={allTasks}
              allMembers={allMembers}
              onTaskUpdate={onTaskUpdate}
              onSubtaskAdd={onSubtaskAdd}
              onEdit={onEdit}
              showProjectName={showProjectName}
              isCoreTask={true}
              subtaskCount={subTasks.length}
            >
                <AccordionTrigger className="w-8 h-8 p-1 absolute right-2 top-1/2 -translate-y-1/2 rounded-md hover:bg-accent [&[data-state=open]>svg]:rotate-180">
                    {subTasks.length > 0 && <ChevronsUpDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}
                </AccordionTrigger>
            </TaskCard>
            {subTasks.length > 0 && (
                <AccordionContent className="pt-0">
                    <div className="pl-8 mt-2 space-y-2 border-l-2 border-dashed ml-7">
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
                                isCoreTask={false}
                            />
                        ))}
                    </div>
                </AccordionContent>
            )}
          </AccordionItem>
        )
      })}
    </Accordion>
  );
}
