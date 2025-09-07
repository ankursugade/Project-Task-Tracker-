
"use client";

import { useState } from "react";
import { PlusCircle, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberList } from "./MemberList";
import { memberStore } from "@/lib/store";
import type { Member } from "@/lib/types";
import { AddMemberDialog } from "./AddMemberDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function MemberSection() {
  const [members, setMembers] = useState<Member[]>(memberStore.getMembers());
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const handleMemberAdd = (newMember: Member) => {
    memberStore.addMember(newMember);
    setMembers(memberStore.getMembers());
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight">
          Team Overview
        </h2>
        <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={view} onValueChange={(value) => {if (value) setView(value as "grid" | "list")}}>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
            <Button onClick={() => setAddMemberOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Member
            </Button>
        </div>
      </div>
      <MemberList members={members} view={view} />
      <AddMemberDialog
        isOpen={isAddMemberOpen}
        setIsOpen={setAddMemberOpen}
        onMemberAdd={handleMemberAdd}
      />
    </section>
  );
}
