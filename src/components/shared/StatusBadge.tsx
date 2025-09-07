import { Badge } from "@/components/ui/badge";
import type { ProjectStage, TaskStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: ProjectStage | TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "CLOSED" || status === "Handover" ? "default"
    : status === "WIP" || status === "Construction" ? "secondary"
    : status === "OPEN" || status === "Design" ? "outline"
    : "outline";
  
  const colorClass = 
    status === "WIP" ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    : status === "Construction" ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    : status === "OPEN" ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    : status === "CLOSED" ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : status === "Handover" ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : status === "Design" ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    : '';


  return <Badge variant={variant} className={colorClass}>{status}</Badge>;
}
