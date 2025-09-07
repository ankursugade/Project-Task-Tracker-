
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Member } from "@/lib/types";

interface MemberListItemProps {
  member: Member;
  openTasks: number;
  dueTodayTasks: number;
}

export function MemberListItem({ member, openTasks, dueTodayTasks }: MemberListItemProps) {
  return (
    <Link href={`/dashboard/team/${member.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">Team Member</p>
                </div>
            </div>
          
            <div className="text-center">
                <p className="text-xl font-bold">{openTasks}</p>
                <p className="text-xs text-muted-foreground">Open Tasks</p>
            </div>
            <div className="text-center">
                <p className="text-xl font-bold text-destructive">{dueTodayTasks}</p>
                <p className="text-xs text-muted-foreground">Due Today</p>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
