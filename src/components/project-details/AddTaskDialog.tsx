"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task, Member, TaskStatus } from "@/lib/types";
import { MemberCombobox } from "../shared/MemberCombobox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";

interface AddTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onTaskAdd: (task: Task) => void;
  allMembers: Member[];
  projectTasks: Task[];
}

export function AddTaskDialog({ isOpen, setIsOpen, onTaskAdd, allMembers, projectTasks }: AddTaskDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [dependencyId, setDependencyId] = useState<string>("");
  const [assignedBy, setAssignedBy] = useState<string>("");
  const [isSubtask, setIsSubtask] = useState(false);
  const [parentId, setParentId] = useState<string>("");

  const coreTasks = projectTasks.filter(t => !t.parentId);

  const handleSubmit = () => {
    if (!name || !startDate || !endDate || assignedTo.length === 0 || !assignedBy || (isSubtask && !parentId)) {
      // Add proper validation/toast later
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      name,
      description,
      status: "OPEN" as TaskStatus,
      startDate,
      endDate,
      assignedTo,
      assignedBy,
      dependencyId: dependencyId || undefined,
      parentId: isSubtask ? parentId : undefined,
    };

    onTaskAdd(newTask);
    setIsOpen(false);
    // Reset form
    setName("");
    setDescription("");
    setStartDate(undefined);
    setEndDate(undefined);
    setAssignedTo([]);
    setDependencyId("");
    setAssignedBy("");
    setIsSubtask(false);
    setParentId("");
  };

  const toggleAssignee = (memberId: string) => {
    setAssignedTo(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId].slice(0, 4) // Max 4 members
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Task</DialogTitle>
          <DialogDescription>
            Detail the new task for your project. You can create a core task or a sub-task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="is-subtask">Is this a sub-task?</Label>
              <Switch id="is-subtask" checked={isSubtask} onCheckedChange={setIsSubtask} />
            </div>
            {isSubtask && (
               <div className="space-y-2">
                  <Label>Parent Task</Label>
                  <Select onValueChange={setParentId}>
                    <SelectTrigger><SelectValue placeholder="Select a parent task" /></SelectTrigger>
                    <SelectContent>
                      {coreTasks.map(task => (
                        <SelectItem key={task.id} value={task.id}>{task.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="name">Task Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned By</Label>
              <MemberCombobox members={allMembers} selectedMember={assignedBy} setSelectedMember={setAssignedBy} />
            </div>
            <div className="space-y-2">
                <Label>Assign To (up to 4)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                            {assignedTo.length > 0 ? `${assignedTo.length} members selected` : "Select members"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search members..." />
                        <CommandList>
                            <CommandEmpty>No members found.</CommandEmpty>
                            <CommandGroup>
                                {allMembers.map(member => (
                                    <CommandItem key={member.id} onSelect={() => toggleAssignee(member.id)}>
                                        <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", assignedTo.includes(member.id) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                        {member.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
              <Label>Dependency</Label>
              <Select onValueChange={setDependencyId}>
                <SelectTrigger><SelectValue placeholder="Optional: Select dependent task" /></SelectTrigger>
                <SelectContent>
                  {projectTasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>{task.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
