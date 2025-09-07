
import type { Member, Project, Task, ProjectStage, TaskStatus } from '@/lib/types';

// =================================================================================
// MEMBERS
// =================================================================================
export const MEMBERS: Member[] = Array.from({ length: 18 }, (_, i) => ({
  id: `mem-${i + 1}`,
  name: `Member ${i + 1}`,
  avatarUrl: `https://picsum.photos/seed/member${i + 1}/40/40`,
}));

const projectLeadIds = ['mem-1', 'mem-2', 'mem-3'];
const designCaptainIds = ['mem-1', 'mem-2', 'mem-3', 'mem-4'];

// =================================================================================
// TASKS
// =================================================================================
const generateTasksForProject = (projectIndex: number): Task[] => {
  const tasks: Task[] = [];
  const statuses: TaskStatus[] = ['OPEN', 'WIP', 'CLOSED'];
  let parentId: string | undefined = undefined;
  let coreTaskCounter = 0;
  let subTaskCounter = 1;

  for (let i = 0; i < 30; i++) {
    const taskId = `t${projectIndex}-${i + 1}`;
    let taskName = "";
    
    if (i % 5 === 0) {
        parentId = taskId;
        coreTaskCounter++;
        taskName = `Core Task`;
        subTaskCounter = 1;
    } else {
        taskName = `Sub-task`;
        subTaskCounter++;
    }

    const status = statuses[i % statuses.length];
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (projectIndex * 30) + i);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (i % 7) + 2); // End date is 2-9 days after start, deterministic

    const assignedToCount = (i % 4) + 1; // Deterministic count
    const assignedTo: string[] = [];
    for(let j = 0; j < assignedToCount; j++) {
        const memberIndex = (projectIndex + i + j) % MEMBERS.length;
        assignedTo.push(MEMBERS[memberIndex].id);
    }

    const assignedBy = MEMBERS[(projectIndex + i) % MEMBERS.length].id;
    
    const dependencyId = i > 0 && i % 5 !== 1 ? `t${projectIndex}-${i}` : undefined;

    tasks.push({
      id: taskId,
      name: taskName,
      description: `This is the detailed description for ${taskName}. It involves several steps and requires careful execution.`,
      status,
      startDate,
      endDate,
      assignedTo,
      assignedBy,
      dependencyId: status !== 'CLOSED' ? dependencyId : undefined,
      parentId: (i % 5 !== 0) ? parentId : undefined,
      revision: 0,
    });
  }
  
  // Add numbering
  const coreTasks = tasks.filter(t => !t.parentId);
  coreTasks.forEach((coreTask, index) => {
    coreTask.name = `${index + 1}. ${coreTask.name}`;
    const subTasks = tasks.filter(t => t.parentId === coreTask.id);
    subTasks.forEach((subTask, subIndex) => {
      subTask.name = `${index + 1}.${subIndex + 1}. ${subTask.name}`;
    });
  });

  return tasks;
};

// =================================================================================
// PROJECTS
// =================================================================================
const projectStages: ProjectStage[] = ['Pitch', 'Design', 'Construction', 'Handover'];

export const PROJECTS: Project[] = Array.from({ length: 9 }, (_, i) => {
  const projectIndex = i + 1;
  return {
    id: `proj-${projectIndex}`,
    name: `Sample Project ${projectIndex}`,
    stage: projectStages[i % projectStages.length],
    projectLead: projectLeadIds[i % projectLeadIds.length],
    designCaptain: designCaptainIds[i % designCaptainIds.length],
    tasks: generateTasksForProject(projectIndex),
  };
});
