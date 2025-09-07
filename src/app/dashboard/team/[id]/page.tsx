import { notFound } from "next/navigation";
import { MEMBERS, PROJECTS } from "@/lib/data";
import { Header } from "@/components/Header";
import { MemberDetailHeader } from "@/components/team-details/MemberDetailHeader";
import { MemberTaskSection } from "@/components/team-details/MemberTaskSection";
import type { Task, Project } from "@/lib/types";

export async function generateStaticParams() {
  return MEMBERS.map((member) => ({
    id: member.id,
  }));
}

export default function MemberPage({ params }: { params: { id: string } }) {
  const member = MEMBERS.find((p) => p.id === params.id);
  
  if (!member) {
    notFound();
  }

  const memberTasksByProject: { project: Project; tasks: Task[] }[] = PROJECTS.map(project => {
    const tasks = project.tasks.filter(task => task.assignedTo.includes(member.id));
    return { project, tasks };
  }).filter(group => group.tasks.length > 0);

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <MemberDetailHeader member={member} />
          <MemberTaskSection tasksByProject={memberTasksByProject} allMembers={MEMBERS} />
        </div>
      </main>
    </div>
  );
}
