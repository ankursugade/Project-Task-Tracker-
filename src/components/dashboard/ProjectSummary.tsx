import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project, ProjectStage } from "@/lib/types";
import { Briefcase, DraftingCompass, HardHat, ChevronsRight } from 'lucide-react';

interface ProjectSummaryProps {
  projects: Project[];
  onStageClick: (stage: ProjectStage) => void;
}

export function ProjectSummary({ projects, onStageClick }: ProjectSummaryProps) {
  const stageCounts = projects.reduce(
    (acc, project) => {
      acc[project.stage] = (acc[project.stage] || 0) + 1;
      return acc;
    },
    { Pitch: 0, Design: 0, Construction: 0, Handover: 0 } as Record<string, number>
  );

  const summaryData = [
    { title: "Pitch", count: stageCounts.Pitch, icon: Briefcase, color: "text-red-500" },
    { title: "Design", count: stageCounts.Design, icon: DraftingCompass, color: "text-purple-500" },
    { title: "Construction", count: stageCounts.Construction, icon: HardHat, color: "text-yellow-500" },
    { title: "Handover", count: stageCounts.Handover, icon: ChevronsRight, color: "text-green-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {summaryData.map((item) => (
        <button key={item.title} onClick={() => onStageClick(item.title as ProjectStage)} className="text-left w-full">
            <Card className="hover:bg-muted/50 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <item.icon className={`h-4 w-4 text-muted-foreground ${item.color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{item.count}</div>
                <p className="text-xs text-muted-foreground">
                {item.count === 1 ? "project" : "projects"} in this stage
                </p>
            </CardContent>
            </Card>
        </button>
      ))}
    </div>
  );
}
