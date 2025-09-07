'use client';
import { useEffect } from 'react';
import type { Project, Member } from '@/lib/types';
import { StatusBadge } from '../shared/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import type { SummarizeProjectOutput } from '@/ai/flows/summarizeProjectFlow';
import { LayoutGrid, ChevronsRight, HardHat, DraftingCompass, Briefcase, GitBranch } from 'lucide-react';

interface ProjectReportProps {
  project: Project;
  allMembers: Member[];
  aiSummary: SummarizeProjectOutput;
  onRendered: () => void;
}

export function ProjectReport({ project, allMembers, aiSummary, onRendered }: ProjectReportProps) {
  useEffect(() => {
    // Give a tick for images to load before capturing
    const timer = setTimeout(() => {
      onRendered();
    }, 500); 
    return () => clearTimeout(timer);
  }, [onRendered]);
  
  const lead = allMembers.find(m => m.id === project.projectLead);
  const captain = allMembers.find(m => m.id === project.designCaptain);
  
  const taskCount = project.tasks.length;
  const openCount = project.tasks.filter(t => t.status === 'OPEN').length;
  const wipCount = project.tasks.filter(t => t.status === 'WIP').length;
  const closedCount = project.tasks.filter(t => t.status === 'CLOSED').length;
  const progress = taskCount > 0 ? (closedCount / taskCount) * 100 : 0;
  
  const blockedTasks = project.tasks.filter(task => {
    if (!task.dependencyId) return false;
    const dependency = project.tasks.find(d => d.id === task.dependencyId);
    return dependency && (dependency.status === 'OPEN' || dependency.status === 'WIP');
  });

  return (
    <div className="w-[800px] bg-background text-foreground p-8 font-body border-4 border-primary/20">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b-2 border-primary/20">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold font-headline text-primary">Projects & Tasks Tracker</h1>
            <p className="text-muted-foreground">Project Status Report</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">{project.name}</p>
          <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-8">
        {/* Project Metadata */}
        <section className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold text-muted-foreground mb-2">Project Lead</h3>
            <div className="flex items-center gap-2">
              {lead && <Avatar className="h-8 w-8"><AvatarImage src={lead.avatarUrl} /><AvatarFallback>{lead.name[0]}</AvatarFallback></Avatar>}
              <span className="font-medium">{lead?.name || 'N/A'}</span>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold text-muted-foreground mb-2">Design Captain</h3>
            <div className="flex items-center gap-2">
              {captain && <Avatar className="h-8 w-8"><AvatarImage src={captain.avatarUrl} /><AvatarFallback>{captain.name[0]}</AvatarFallback></Avatar>}
              <span className="font-medium">{captain?.name || 'N/A'}</span>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold text-muted-foreground mb-2">Current Stage</h3>
            <div className="flex items-center gap-2">
                <StatusBadge status={project.stage} />
            </div>
          </div>
        </section>

        {/* AI Summary */}
        <section className="mb-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h2 className="text-xl font-headline font-bold text-primary mb-2">AI-Generated Summary</h2>
            <p className="text-sm text-foreground/80 mb-4">{aiSummary.summary}</p>
            <Separator className="my-4 bg-primary/20" />
            <p className="text-sm font-semibold italic">Remark: <span className="font-normal">{aiSummary.remark}</span></p>
        </section>

        {/* Task Progress */}
        <section className="mb-8">
           <h2 className="text-xl font-headline font-bold text-primary mb-4">Task Overview</h2>
           <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-semibold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
           </div>
           <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-card border rounded-lg">
                <p className="text-2xl font-bold">{taskCount}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
              <div className="p-3 bg-red-50 border-red-200 rounded-lg">
                <p className="text-2xl font-bold text-red-700">{openCount}</p>
                <p className="text-xs text-red-600">Open</p>
              </div>
              <div className="p-3 bg-blue-50 border-blue-200 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{wipCount}</p>
                <p className="text-xs text-blue-600">In Progress</p>
              </div>
              <div className="p-3 bg-green-50 border-green-200 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{closedCount}</p>
                <p className="text-xs text-green-600">Closed</p>
              </div>
           </div>
        </section>

        {/* Hurdles */}
        <section>
          <h2 className="text-xl font-headline font-bold text-destructive mb-4">Hurdles & Blockers</h2>
           <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive/90">
             {blockedTasks.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {blockedTasks.map(task => {
                     const dependency = project.tasks.find(d => d.id === task.dependencyId)!;
                     const assignedToDep = allMembers.filter(m => dependency.assignedTo.includes(m.id)).map(m => m.name).join(', ');
                     return (
                        <li key={task.id} className="flex items-start gap-2">
                           <GitBranch className="h-4 w-4 mt-1 shrink-0" />
                           <div><span className="font-semibold">"{task.name}"</span> is blocked by <span className="font-semibold">"{dependency.name}"</span> (assigned to {assignedToDep})</div>
                        </li>
                     )
                  })}
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
