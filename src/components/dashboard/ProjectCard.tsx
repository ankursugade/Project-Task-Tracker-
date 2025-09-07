
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memberStore } from "@/lib/store";
import type { Project } from "@/lib/types";
import { StatusBadge } from "../shared/StatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserX } from "lucide-react";
import { Badge } from "../ui/badge";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { name, stage, tasks, projectLead, designCaptain } = project;
  const completedTasks = tasks.filter((task) => task.status === "CLOSED").length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const unassignedTasks = tasks.filter(task => task.assignedTo.length === 0).length;

  const allMembers = memberStore.getMembers();
  const lead = allMembers.find((m) => m.id === projectLead);
  const captain = allMembers.find((m) => m.id === designCaptain);

  return (
    <Card className="flex flex-col h-full transition-shadow duration-300 hover:shadow-lg">
      <Link href={`/projects/${project.id}`} className="flex flex-col flex-grow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="font-bold group-hover:text-primary">
              {name}
            </CardTitle>
            <StatusBadge status={stage} />
          </div>
          <CardDescription className="flex items-center gap-4">
            <span>{tasks.length} tasks</span>
             {unassignedTasks > 0 && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge variant="destructive" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800">
                                <UserX className="h-3 w-3" />
                                {unassignedTasks} unassigned
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{unassignedTasks} task(s) need assignments.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted-foreground">Team</span>
            <div className="flex -space-x-2">
              {lead && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="border-2 border-background">
                        <AvatarImage src={lead.avatarUrl} alt={lead.name} />
                        <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>Project Lead: {lead.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {captain && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="border-2 border-background">
                        <AvatarImage src={captain.avatarUrl} alt={captain.name} />
                        <AvatarFallback>{captain.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>Design Captain: {captain.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
