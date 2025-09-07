export type Member = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type TaskStatus = 'OPEN' | 'WIP' | 'CLOSED';

export type Task = {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  startDate: Date;
  endDate: Date;
  assignedTo: string[]; // Array of Member IDs
  assignedBy: string; // Member ID
  dependencyId?: string; // Task ID
};

export type ProjectStage = 'Pitch' | 'Design' | 'Construction' | 'Handover';

export type Project = {
  id: string;
  name: string;
  stage: ProjectStage;
  projectLead: string; // Member ID
  designCaptain: string; // Member ID
  tasks: Task[];
};
