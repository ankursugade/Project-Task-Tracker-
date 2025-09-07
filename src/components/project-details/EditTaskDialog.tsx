
"use client";

import { useState, useEffect } from "react";
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
import { cn, calculateEndDate } from "@/lib/utils";
import type { Task, Member } from "@/lib/types";
import { MemberCombobox } from "../shared/MemberCombobox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { useToast } from "@/hooks/use-toast";
import { TaskCombobox } from "../shared/TaskCombobox";
import { Checkbox } from "../ui/checkbox";

interface EditTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onTaskUpdate: (task: Task, changedById: string) => void;
  allMembers: Member[];
  projectTasks: Task[];
  taskToEdit: Task;
}

export function EditTaskDialog({ isOpen, setIsOpen, onTaskUpdate, allMembers, projectTasks, taskToEdit }: EditTaskDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [duration, setDuration] = useState<number | undefined>();
  const [weekdaysOnly, setWeekdaysOnly] = useState(true);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [dependencyId, setDependencyId] = useState<string>("");
  const [assignedBy, setAssignedBy] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setDescription(taskToEdit.description);
      setStartDate(taskToEdit.startDate);
      setEndDate(taskToEdit.endDate);
      setAssignedTo(taskToEdit.assignedTo);
      setDependencyId(taskToEdit.dependencyId || "");
      setAssignedBy(taskToEdit.assignedBy);
      setDuration(undefined); // Reset duration on new task edit
      setWeekdaysOnly(true);
    }
  }, [taskToEdit]);
  
  useEffect(() => {
    if (startDate && duration && duration > 0) {
      const newEndDate = calculateEndDate(startDate, duration, weekdaysOnly);
      setEndDate(newEndDate);
    }
  }, [startDate, duration, weekdaysOnly]);

  const handleSubmit = () => {
    if (!name || !startDate || !endDate || assignedTo.length === 0 || !assignedBy) {
       toast({
        title: "Validation Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    const updatedTask: Task = {
      ...taskToEdit,
      name,
      description,
      startDate,
      endDate,
      assignedTo,
      assignedBy,
      dependencyId: dependencyId || undefined,
    };

    onTaskUpdate(updatedTask, assignedBy); // Pass who made the change
    setIsOpen(false);
  };

  const toggleAssignee = (memberId: string) => {
    setAssignedTo(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId].slice(0, 4)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details for this task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
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
                        <PopoverContent className="w-auto p-0">
                           <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                           <div className="p-2 border-t">
                              <Button size="sm" className="w-full" onClick={() => setStartDate(new Date())}>Today</Button>
                           </div>
                        </PopoverContent>
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
                        <PopoverContent className="w-auto p-0">
                           <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                            <div className="p-2 border-t">
                              <Button size="sm" className="w-full" onClick={() => setEndDate(new Date())}>Today</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
             <div className="space-y-2 p-3 rounded-md border bg-muted/50">
                <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                        <Label htmlFor="duration">Working Days</Label>
                        <Input 
                            id="duration" 
                            type="number" 
                            value={duration || ""}
                            onChange={(e) => setDuration(parseInt(e.target.value, 10) || undefined)}
                            placeholder="e.g. 5"
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <Checkbox 
                            id="weekdays-only-edit" 
                            checked={weekdaysOnly} 
                            onCheckedChange={(checked) => setWeekdaysOnly(Boolean(checked))}
                        />
                        <Label htmlFor="weekdays-only-edit" className="text-sm font-normal">Weekdays only</Label>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">Set a start date and working days to auto-calculate the end date.</p>
            </div>
            <div className="space-y-2">
              <Label>Assigned By (Editor)</Label>
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
                <TaskCombobox 
                    tasks={projectTasks.filter(t => t.id !== taskToEdit.id)}
                    selectedTask={dependencyId}
                    setSelectedTask={setDependencyId}
                    placeholder="Optional: Select dependent task"
                />
            </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Update Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
