
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { memberStore } from "@/lib/store";
import type { Project } from "@/lib/types";
import { StatusBadge } from "../shared/StatusBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectListItemProps {
  project: Project;
}

export function ProjectListItem({ project }: ProjectListItemProps) {
  const { name, stage, tasks, projectLead, designCaptain } = project;
  const completedTasks = tasks.filter((task) => task.status === "CLOSED").length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  
  const allMembers = memberStore.getMembers();
  const lead = allMembers.find((m) => m.id === projectLead);
  const captain = allMembers.find((m) => m.id === designCaptain);

  return (
    <Link href={`/projects/${project.id}`} className="block">
        <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          <div className="md:col-span-2 flex items-center gap-4">
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">{tasks.length} tasks</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-between md:justify-end">
            <StatusBadge status={stage} />
            <div className="flex -space-x-2">
                {lead && (
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                        <Avatar className="border-2 border-background">
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
                            <AvatarFallback>{captain.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>Design Captain: {captain.name}</TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                )}
            </div>
          </div>
          
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
          </div>

        </CardContent>
        </Card>
    </Link>
  );
}
