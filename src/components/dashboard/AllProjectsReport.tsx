'use client';
import { useEffect } from 'react';
import type { Project, Member, ProjectStage } from '@/lib/types';
import { StatusBadge } from '../shared/StatusBadge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import type { SummarizeAllProjectsOutput } from '@/ai/flows/summarizeAllProjectsFlow';
import { LayoutGrid, AlertTriangle, GitBranch } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface AllProjectsReportProps {
  projects: Project[];
  allMembers: Member[];
  aiSummary: SummarizeAllProjectsOutput;
  onRendered: () => void;
}

export function AllProjectsReport({ projects, allMembers, aiSummary, onRendered }: AllProjectsReportProps) {
  useEffect(() => {
    // Give a tick for images and charts to load before capturing
    const timer = setTimeout(() => {
      onRendered();
    }, 1000); 
    return () => clearTimeout(timer);
  }, [onRendered]);

  const totalProjects = projects.length;
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const totalClosedTasks = projects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'CLOSED').length, 0);
  const overallProgress = totalTasks > 0 ? (totalClosedTasks / totalTasks) * 100 : 0;
  
  const stageCounts = projects.reduce((acc, project) => {
      acc[project.stage] = (acc[project.stage] || 0) + 1;
      return acc;
    }, {} as Record<ProjectStage, number>);
    
  const chartData = (['Pitch', 'Design', 'Construction', 'Handover'] as ProjectStage[]).map(stage => ({
    name: stage,
    projects: stageCounts[stage] || 0,
  }));

  const allBlockedTasks = projects.flatMap(project => 
    project.tasks.filter(task => {
        if (!task.dependencyId) return false;
        const dependency = project.tasks.find(d => d.id === task.dependencyId);
        return dependency && (dependency.status === 'OPEN' || dependency.status === 'WIP');
    }).map(task => ({
        ...task,
        projectName: project.name,
    }))
  );

  return (
    <div className="w-[800px] bg-background text-foreground p-8 font-body border-4 border-primary/20">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b-2 border-primary/20">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold font-headline text-primary">Projects & Tasks Tracker</h1>
            <p className="text-muted-foreground">Project Portfolio Status Report</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">All Projects Summary</p>
          <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-8">
        {/* AI Summary */}
        <section className="mb-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h2 className="text-xl font-headline font-bold text-primary mb-2">AI-Generated Portfolio Summary</h2>
            <p className="text-sm text-foreground/80 mb-4">{aiSummary.summary}</p>
            <Separator className="my-4 bg-primary/20" />
            <p className="text-sm font-semibold italic">Remark: <span className="font-normal">{aiSummary.remark}</span></p>
        </section>
        
        {/* KPIs */}
        <section className="grid grid-cols-3 gap-4 text-center mb-8">
              <div className="p-3 bg-card border rounded-lg">
                <p className="text-2xl font-bold">{totalProjects}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
              <div className="p-3 bg-card border rounded-lg">
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
              <div className="p-3 bg-card border rounded-lg">
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
                <p className="text-xs text-muted-foreground">Overall Completion</p>
              </div>
        </section>

        {/* Stage Distribution */}
        <section className="mb-8">
           <h2 className="text-xl font-headline font-bold text-primary mb-4">Stage Distribution</h2>
           <div className="h-[200px] w-full">
            <ChartContainer config={{
                projects: { label: "Projects", color: "hsl(var(--primary))" }
            }}>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="projects" fill="var(--color-projects)" radius={4} />
                </BarChart>
            </ChartContainer>
           </div>
        </section>

        {/* Hurdles */}
        <section>
          <h2 className="text-xl font-headline font-bold text-destructive mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Portfolio Hurdles & Blockers</h2>
           <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive/90">
             {allBlockedTasks.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {allBlockedTasks.slice(0, 5).map(task => { // Limit to 5 for brevity in summary
                     const dependency = allMembers.find(d => d.id === task.dependencyId);
                     return (
                        <li key={task.id} className="flex items-start gap-2">
                           <GitBranch className="h-4 w-4 mt-1 shrink-0" />
                           <div><span className="font-semibold">"{task.name}"</span> in project <span className="font-semibold">"{task.projectName}"</span> is currently blocked.</div>
                        </li>
                     )
                  })}
                  {allBlockedTasks.length > 5 && <li>...and {allBlockedTasks.length - 5} more.</li>}
                </ul>
             ) : (
                <p className="text-sm text-muted-foreground">{aiSummary.hurdles}</p>
             )}
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t-2 border-primary/20 text-center">
        <p className="text-xs text-muted-foreground">This is an auto-generated document from Projects & Tasks Tracker.</p>
      </footer>
    </div>
  );
}
