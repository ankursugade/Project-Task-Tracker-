"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberList } from "./MemberList";
import { MEMBERS } from "@/lib/data";
import type { Member } from "@/lib/types";
import { AddMemberDialog } from "./AddMemberDialog";

export function MemberSection() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);

  const handleMemberAdd = (newMember: Omit<Member, 'id' | 'avatarUrl'>) => {
    const newMemberWithId: Member = {
      ...newMember,
      id: `mem-${Date.now()}`,
      avatarUrl: `https://picsum.photos/seed/${newMember.name.split(' ')[0]}/40/40`,
    };
    setMembers((prev) => [newMemberWithId, ...prev]);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          Team Overview
        </h2>
        <Button onClick={() => setAddMemberOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>
      <MemberList members={members} />
      <AddMemberDialog
        isOpen={isAddMemberOpen}
        setIsOpen={setAddMemberOpen}
        onMemberAdd={handleMemberAdd}
      />
    </section>
  );
}