
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { memberStore } from "@/lib/store";
import type { Project, ProjectStage, Member } from "@/lib/types";
import { MemberCombobox } from "../shared/MemberCombobox";
import { useToast } from "@/hooks/use-toast";

interface AddProjectDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onProjectAdd: (project: Project) => void;
  projects: Project[]; // Receive the current list of projects
}

const projectStages: ProjectStage[] = ["Pitch", "Design", "Construction", "Handover"];

export function AddProjectDialog({ isOpen, setIsOpen, onProjectAdd, projects }: AddProjectDialogProps) {
  const [name, setName] = useState("");
  const [stage, setStage] = useState<ProjectStage>("Pitch");
  const [projectLead, setProjectLead] = useState<string>("");
  const [designCaptain, setDesignCaptain] = useState<string>("");
  const [copyFrom, setCopyFrom] = useState<string>("");
  const { toast } = useToast();

  const allMembers = memberStore.getMembers();

  const handleSubmit = () => {
    if (!name || !projectLead || !designCaptain) {
      toast({
        title: "Missing Information",
        description: "Please fill out the Name, Project Lead, and Design Captain fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Use the passed `projects` prop which is the live state
    const projectToCopy = projects.find(p => p.id === copyFrom);

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      stage,
      projectLead,
      designCaptain,
      tasks: copyFrom ? projectToCopy?.tasks.map(t => ({...t, id: `task-${Date.now()}-${t.id}`, assignedTo: []})) || [] : [],
    };
    onProjectAdd(newProject);
    setIsOpen(false);
    // Reset form
    setName("");
    setStage("Pitch");
    setProjectLead("");
    setDesignCaptain("");
    setCopyFrom("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Project</DialogTitle>
          <DialogDescription>
            Fill in the details for your new project. You can also copy tasks from an existing project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stage" className="text-right">Stage</Label>
            <Select onValueChange={(value: ProjectStage) => setStage(value)} defaultValue={stage}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a stage" />
              </SelectTrigger>
              <SelectContent>
                {projectStages.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lead" className="text-right">Project Lead</Label>
            <div className="col-span-3">
              <MemberCombobox members={allMembers} selectedMember={projectLead} setSelectedMember={setProjectLead} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="captain" className="text-right">Design Captain</Label>
            <div className="col-span-3">
              <MemberCombobox members={allMembers} selectedMember={designCaptain} setSelectedMember={setDesignCaptain} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="copy" className="text-right">Copy Tasks</Label>
            <Select onValueChange={setCopyFrom}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Optional: copy from..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
