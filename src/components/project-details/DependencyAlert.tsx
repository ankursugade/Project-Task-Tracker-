"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Task, Member } from "@/lib/types";

interface DependencyAlertProps {
  allTasks: Task[];
  allMembers: Member[];
}

export function DependencyAlert({ allTasks, allMembers }: DependencyAlertProps) {
  const blockedTasks = allTasks.filter(task => {
    if (!task.dependencyId) return false;
    const dependency = allTasks.find(d => d.id === task.dependencyId);
    return dependency && (dependency.status === 'OPEN' || dependency.status === 'WIP');
  });

  if (blockedTasks.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6 bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300 [&>svg]:text-orange-500">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Blocked Tasks Alert</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5 space-y-1 mt-2">
            {blockedTasks.map(task => {
                const dependency = allTasks.find(d => d.id === task.dependencyId)!;
                const assignedToDependency = allMembers
                    .filter(m => dependency.assignedTo.includes(m.id))
                    .map(m => m.name)
                    .join(", ");

                return (
                    <li key={task.id}>
                        <span className="font-semibold">"{task.name}"</span> is waiting for <span className="font-semibold">"{dependency.name}"</span> which is assigned to: {assignedToDependency}.
                    </li>
                )
            })}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
