"use client";

import { notFound, useParams } from "next/navigation";
import { memberStore, projectStore } from "@/lib/store";
import { Header } from "@/components/Header";
import { MemberDetailHeader } from "@/components/team-details/MemberDetailHeader";
import { MemberTaskSection } from "@/components/team-details/MemberTaskSection";
import type { Task, Project } from "@/lib/types";

export default function MemberPage() {
  const params = useParams();
  const memberId = params.id as string;
  const member = memberStore.getMemberById(memberId);
  
  if (!member) {
    notFound();
  }

  const allProjects = projectStore.getProjects();
  const allMembers = memberStore.getMembers();

  const memberTasksByProject: { project: Project; tasks: Task[] }[] = allProjects.map(project => {
    const tasks = project.tasks.filter(task => task.assignedTo.includes(member.id));
    return { project, tasks };
  }).filter(group => group.tasks.length > 0);

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <MemberDetailHeader member={member} />
          <MemberTaskSection tasksByProject={memberTasksByProject} allMembers={allMembers} />
        </div>
      </main>
    </div>
  );
}
