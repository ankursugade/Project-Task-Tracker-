
import Link from "next/link";
import { ChevronLeft, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project, ProjectStage } from "@/lib/types";
import { MEMBERS } from "@/lib/data";
import { StatusBadge } from "../shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const projectStages: ProjectStage[] = ["Pitch", "Design", "Construction", "Handover"];

interface ProjectDetailHeaderProps {
  project: Project;
  onExportPDF: () => void;
  isPdfLoading: boolean;
  onStageChange: (newStage: ProjectStage) => void;
}

export function ProjectDetailHeader({ project, onExportPDF, isPdfLoading, onStageChange }: ProjectDetailHeaderProps) {
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
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold font-headline">{project.name}</h1>
             <Select onValueChange={onStageChange} value={project.stage}>
                <SelectTrigger className="w-auto border-none shadow-none bg-transparent p-0 h-auto focus:ring-0 focus:ring-offset-0">
                  <SelectValue asChild>
                    <StatusBadge status={project.stage} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {projectStages.map(stage => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <p className="text-muted-foreground mt-1">Manage and track all tasks for this project.</p>
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
      <Separator className="my-6" />
        <Button variant="outline" onClick={onExportPDF} disabled={isPdfLoading} className="h-auto py-2">
            <div className="flex items-center gap-2">
                {isPdfLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <FileText className="h-4 w-4" />
                )}
                <div className="flex flex-col items-start text-left">
                    <span>Export Project Summary</span>
                    <span className="text-xs text-muted-foreground -mt-0.5">PDF Copy</span>
                </div>
            </div>
        </Button>
    </div>
  );
}
