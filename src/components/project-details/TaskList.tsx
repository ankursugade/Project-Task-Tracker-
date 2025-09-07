import type { Task, Member } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  allTasks: Task[];
  allMembers: Member[];
  onTaskUpdate: (task: Task) => void;
}

export function TaskList({ tasks, allTasks, allMembers, onTaskUpdate }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-card">
        <p className="text-muted-foreground">No tasks match your filters.</p>
        <p className="text-sm text-muted-foreground">Clear filters or add a new task.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          allTasks={allTasks}
          allMembers={allMembers}
          onTaskUpdate={onTaskUpdate}
        />
      ))}
    </div>
  );
}
