import type { Member, Project, Task } from '@/lib/types';

export const MEMBERS: Member[] = [
  { id: 'mem-1', name: 'Alice Johnson', avatarUrl: 'https://picsum.photos/seed/alice/40/40' },
  { id: 'mem-2', name: 'Bob Williams', avatarUrl: 'https://picsum.photos/seed/bob/40/40' },
  { id: 'mem-3', name: 'Charlie Brown', avatarUrl: 'https://picsum.photos/seed/charlie/40/40' },
  { id: 'mem-4', name: 'Diana Miller', avatarUrl: 'https://picsum.photos/seed/diana/40/40' },
  { id: 'mem-5', name: 'Ethan Davis', avatarUrl: 'https://picsum.photos/seed/ethan/40/40' },
  { id: 'mem-6', name: 'Fiona Garcia', avatarUrl: 'https://picsum.photos/seed/fiona/40/40' },
];

const tasksProject1: Task[] = [
  { id: 't1-1', name: 'Initial Client Meeting', description: 'Discuss project scope and requirements.', status: 'CLOSED', startDate: new Date('2024-07-01'), endDate: new Date('2024-07-02'), assignedTo: ['mem-1'], assignedBy: 'mem-2' },
  { id: 't1-2', name: 'Create Wireframes', description: 'Develop low-fidelity wireframes for the main screens.', status: 'WIP', startDate: new Date('2024-07-03'), endDate: new Date('2024-07-10'), assignedTo: ['mem-3', 'mem-4'], assignedBy: 'mem-1', dependencyId: 't1-1' },
  { id: 't1-3', name: 'Develop UI Mockups', description: 'Design high-fidelity mockups based on wireframes.', status: 'OPEN', startDate: new Date('2024-07-11'), endDate: new Date('2024-07-18'), assignedTo: ['mem-4'], assignedBy: 'mem-1', dependencyId: 't1-2' },
  { id: 't1-4', name: 'Frontend Development', description: 'Code the user interface.', status: 'OPEN', startDate: new Date('2024-07-19'), endDate: new Date('2024-08-05'), assignedTo: ['mem-5', 'mem-6'], assignedBy: 'mem-2', dependencyId: 't1-3' },
];

const tasksProject2: Task[] = [
  { id: 't2-1', name: 'Market Research', description: 'Analyze competitors and target audience.', status: 'CLOSED', startDate: new Date('2024-06-15'), endDate: new Date('2024-06-20'), assignedTo: ['mem-2'], assignedBy: 'mem-1' },
  { id: 't2-2', name: 'Define MVP Features', description: 'Finalize the feature list for the minimum viable product.', status: 'CLOSED', startDate: new Date('2024-06-21'), endDate: new Date('2024-06-25'), assignedTo: ['mem-1', 'mem-2'], assignedBy: 'mem-1', dependencyId: 't2-1' },
];

const tasksProject3: Task[] = [
    { id: 't3-1', name: 'Setup Staging Environment', description: 'Configure servers and CI/CD pipeline.', status: 'WIP', startDate: new Date('2024-07-20'), endDate: new Date(), assignedTo: ['mem-5'], assignedBy: 'mem-2'},
    { id: 't3-2', name: 'User Acceptance Testing', description: 'Internal team to test the pre-release version.', status: 'OPEN', startDate: new Date(), endDate: new Date(new Date().setDate(new Date().getDate() + 7)), assignedTo: ['mem-1', 'mem-3', 'mem-4'], assignedBy: 'mem-2', dependencyId: 't3-1'},
];

const tasksProject4: Task[] = [
    { id: 't4-1', name: 'Final Documentation', description: 'Prepare all project documentation for handover.', status: 'WIP', startDate: new Date('2024-07-28'), endDate: new Date('2024-08-10'), assignedTo: ['mem-1'], assignedBy: 'mem-2' },
    { id: 't4-2', name: 'Client Training Session', description: 'Train the client team on using the new system.', status: 'OPEN', startDate: new Date('2024-08-11'), endDate: new Date('2024-08-12'), assignedTo: ['mem-1', 'mem-4'], assignedBy: 'mem-2', dependencyId: 't4-1' },
]

export const PROJECTS: Project[] = [
  { id: 'proj-1', name: 'E-commerce Platform', stage: 'Design', projectLead: 'mem-1', designCaptain: 'mem-4', tasks: tasksProject1 },
  { id: 'proj-2', name: 'Mobile Banking App', stage: 'Pitch', projectLead: 'mem-2', designCaptain: 'mem-1', tasks: tasksProject2 },
  { id: 'proj-3', name: 'Internal CRM Tool', stage: 'Construction', projectLead: 'mem-2', designCaptain: 'mem-3', tasks: tasksProject3 },
  { id: 'proj-4', name: 'Data Analytics Dashboard', stage: 'Handover', projectLead: 'mem-1', designCaptain: 'mem-4', tasks: tasksProject4 },
  { id: 'proj-5', name: 'Smart Home IoT Integration', stage: 'Design', projectLead: 'mem-5', designCaptain: 'mem-6', tasks: [] },
];
