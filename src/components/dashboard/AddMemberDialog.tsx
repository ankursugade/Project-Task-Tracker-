
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Member } from "@/lib/types";

interface AddMemberDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onMemberAdd: (member: Member) => void;
}

export function AddMemberDialog({ isOpen, setIsOpen, onMemberAdd }: AddMemberDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name) {
      // Basic validation
      return;
    }
    
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name,
      avatarUrl: `https://picsum.photos/seed/${name.split(' ')[0]}/40/40`,
    }

    onMemberAdd(newMember);
    setIsOpen(false);
    // Reset form
    setName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Enter the name of the new team member. An avatar will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. John Doe" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Add Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
