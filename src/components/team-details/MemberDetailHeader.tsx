import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Member } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MemberDetailHeaderProps {
  member: Member;
}

export function MemberDetailHeader({ member }: MemberDetailHeaderProps) {
  return (
    <div className="mb-8">
      <Button asChild variant="ghost" className="mb-4 -ml-4">
        <Link href="/dashboard/team">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Team
        </Link>
      </Button>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
            <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person face" />
            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
            <h1 className="text-3xl font-bold font-headline">{member.name}</h1>
            <p className="text-muted-foreground">Viewing all tasks assigned to {member.name}.</p>
        </div>
      </div>
    </div>
  );
}
