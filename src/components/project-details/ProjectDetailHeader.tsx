import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/types";
import { MEMBERS } from "@/lib/data";
import { StatusBadge } from "../shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";

interface ProjectDetailHeaderProps {
  project: Project;
}

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const lead = MEMBERS.find(m => m.id === project.projectLead);
  const captain = MEMBERS.find(m => m.id === project.designCaptain);

  return (
    <div className="mb-8">
      <Button asChild variant="ghost" className="mb-4 -ml-4">
        <Link href="/dashboard/projects">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </Button>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold font-headline">{project.name}</h1>
            <StatusBadge status={project.stage} />
          </div>
          <p className="text-muted-foreground">Manage and track all tasks for this project.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {lead && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="border-2 border-background">
                      <AvatarImage src={lead.avatarUrl} alt={lead.name} data-ai-hint="person face"/>
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
                     <AvatarImage src={captain.avatarUrl} alt={captain.name} data-ai-hint="person face" />
                     <AvatarFallback>{captain.name.charAt(0)}</AvatarFallback>
                   </Avatar>
                 </TooltipTrigger>
                 <TooltipContent>Design Captain: {captain.name}</TooltipContent>
               </Tooltip>
             </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
