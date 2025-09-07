
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Member } from "@/lib/types";

interface MemberCardProps {
  member: Member;
  openTasks: number;
  dueTodayTasks: number;
}

export function MemberCard({ member, openTasks, dueTodayTasks }: MemberCardProps) {
  return (
    <Link href={`/dashboard/team/${member.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-bold">{member.name}</CardTitle>
            <CardDescription>Team Member</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold">{openTasks}</p>
            <p className="text-xs text-muted-foreground">Open Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">{dueTodayTasks}</p>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
