import { projectStore } from "@/lib/store";
import { MemberCard } from "./MemberCard";
import type { Task, Member } from "@/lib/types";
import { MemberListItem } from "./MemberListItem";

interface MemberListProps {
  members: Member[];
  view: "grid" | "list";
}

export function MemberList({ members, view }: MemberListProps) {
  const allTasks: Task[] = projectStore.getAllTasks();

  const getMemberTaskStats = (memberId: string) => {
    const memberTasks = allTasks.filter(task => task.assignedTo.includes(memberId));
    const openTasks = memberTasks.filter(t => t.status === 'OPEN' || t.status === 'WIP').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueTodayTasks = memberTasks.filter(t => {
        if (!t.endDate) return false;
        const endDate = new Date(t.endDate);
        endDate.setHours(0, 0, 0, 0);
        return (t.status === 'OPEN' || t.status === 'WIP') && endDate.getTime() === today.getTime();
    }).length;

    return { openTasks, dueTodayTasks };
  };

  if (view === 'list') {
    return (
      <div className="space-y-4">
        {members.map((member) => {
          const { openTasks, dueTodayTasks } = getMemberTaskStats(member.id);
          return (
            <MemberListItem
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

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member) => {
        const { openTasks, dueTodayTasks } = getMemberTaskStats(member.id);
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
