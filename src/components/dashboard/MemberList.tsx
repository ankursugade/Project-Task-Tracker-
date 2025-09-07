import { PROJECTS } from "@/lib/data";
import { MemberCard } from "./MemberCard";
import type { Task, Member } from "@/lib/types";

interface MemberListProps {
  members: Member[];
}

export function MemberList({ members }: MemberListProps) {
  const allTasks: Task[] = PROJECTS.flatMap(p => p.tasks);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member) => {
        const memberTasks = allTasks.filter(task => task.assignedTo.includes(member.id));
        const openTasks = memberTasks.filter(t => t.status === 'OPEN' || t.status === 'WIP').length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueTodayTasks = memberTasks.filter(t => {
            const endDate = new Date(t.endDate);
            endDate.setHours(0, 0, 0, 0);
            return (t.status === 'OPEN' || t.status === 'WIP') && endDate.getTime() === today.getTime();
        }).length;

        return (
            <MemberCard 
                key={member.id} 
                member={member} 
                openTasks={openTasks} 
                dueTodayTasks={dueTodayTasks} 
            />
        );
      })}
    </div>
  );
}