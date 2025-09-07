
import type { Member, Project, Task, ProjectStage, TaskStatus } from '@/lib/types';
import { addDays, isSaturday, isSunday } from 'date-fns';

// =================================================================================
// UTILITY TO CALCULATE END DATE BASED ON WORKING DAYS
// =================================================================================
function calculateEndDate(startDate: Date, durationDays: number): Date {
  let currentDate = new Date(startDate);
  let daysAdded = 0;
  while (daysAdded < durationDays - 1) {
    currentDate = addDays(currentDate, 1);
    if (!isSaturday(currentDate) && !isSunday(currentDate)) {
      daysAdded++;
    }
  }
  return currentDate;
}


// =================================================================================
// MEMBERS
// =================================================================================
export const MEMBERS: Member[] = [
  { id: 'mem-1', name: 'Priya Sharma' },
  { id: 'mem-2', name: 'Amit Singh' },
  { id: 'mem-3', name: 'Anjali Gupta' },
  { id: 'mem-4', name: 'Rahul Kumar' },
  { id: 'mem-5', name: 'Sneha Reddy' },
  { id: 'mem-6', name: 'Vikram Patel' },
  { id: 'mem-7', name: 'Neha Desai' },
  { id: 'mem-8', name: 'Karan Malhotra' },
];

const projectLeadIds = ['mem-1', 'mem-2', 'mem-3'];
const designCaptainIds = ['mem-4', 'mem-5', 'mem-6'];

// =================================================================================
// TASK TEMPLATE
// =================================================================================
const mepTaskTemplate = [
    // --- CORE: INTERIOR LAYOUTS ---
    { core: true, name: 'INTERIOR LAYOUTS', duration: 3, subtasks: [
        { name: 'INTERIOR LAYOUT- CAD', duration: 2 },
        { name: 'CEILING LAYOUT - CAD', duration: 2, dependsOn: 'INTERIOR LAYOUT- CAD' },
        { name: 'INTERIOR LAYOUT - REVIT', duration: 3, dependsOn: 'INTERIOR LAYOUT- CAD' },
        { name: 'CEILING LAYOUT - REVIT', duration: 3, dependsOn: 'CEILING LAYOUT - CAD' },
    ]},
    // --- CORE: MEP DBR ---
    { core: true, name: 'MEP DBR', duration: 5, subtasks: [
        { name: 'HVAC Calculations', duration: 2, dependsOn: 'INTERIOR LAYOUT- CAD' },
        { name: 'Electrical Calculations', duration: 2, dependsOn: ['INTERIOR LAYOUT- CAD', 'HVAC Calculations'] },
        { name: 'HVAC DBR Update', duration: 1, dependsOn: 'HVAC Calculations' },
        { name: 'Electrical DBR Update', duration: 1, dependsOn: 'Electrical Calculations' },
        { name: 'PHE & FF DBR Update', duration: 2, dependsOn: 'Electrical Calculations' },
        { name: 'IBMS & ELV Update', duration: 2, dependsOn: 'PHE & FF DBR Update' },
    ]},
    // --- CORE: IT Passive DBR ---
    { core: true, name: 'IT Passive DBR', duration: 3, subtasks: [
        { name: 'IT Passive node dist. sheet', duration: 2, dependsOn: 'INTERIOR LAYOUT- CAD' },
        { name: 'IT Passive DBR Update', duration: 1, dependsOn: 'IT Passive node dist. sheet' },
    ]},
    // --- CORE: ELECTRICAL TENDER ---
    { core: true, name: 'ELECTRICAL TENDER', duration: 7, subtasks: [
        { name: 'Electrical SLD', duration: 3, dependsOn: 'Electrical DBR Update' },
        { name: 'Electrical Earthing SLD', duration: 2, dependsOn: 'Electrical SLD' },
        { name: 'Electrical Critical Rooms layout', duration: 3, dependsOn: 'Electrical SLD' },
        { name: 'Electrical Power layout', duration: 3, dependsOn: 'Electrical SLD' },
        { name: 'Electrical Other power layout', duration: 3, dependsOn: 'Electrical Power layout' },
        { name: 'Electrical Under floor containment layout', duration: 2, dependsOn: 'Electrical Power layout' },
        { name: 'Electrical Overhead Containment layout', duration: 2, dependsOn: 'Electrical Power layout' },
        { name: 'Electrical Tender BOQ', duration: 2, dependsOn: [
            'Electrical SLD', 'Electrical Earthing SLD', 'Electrical Critical Rooms layout', 'Electrical Power layout', 
            'Electrical Other power layout', 'Electrical Under floor containment layout', 'Electrical Overhead Containment layout'
        ]},
    ]},
    // --- CORE: HVAC TENDER ---
    { core: true, name: 'HVAC TENDER', duration: 7, subtasks: [
        { name: 'HVAC Calculation sheet HAP Calculations', duration: 2, dependsOn: 'HVAC DBR Update' },
        { name: 'HVAC Comfort cooling layout', duration: 3, dependsOn: 'HVAC Calculation sheet HAP Calculations' },
        { name: 'HVAC critical cooling layout', duration: 3, dependsOn: 'HVAC Calculation sheet HAP Calculations' },
        { name: 'HVAC schematic layout', duration: 3, dependsOn: 'HVAC Calculation sheet HAP Calculations' },
        { name: 'HVAC Tender BOQ', duration: 2, dependsOn: [
            'HVAC Calculation sheet HAP Calculations', 'HVAC Comfort cooling layout', 'HVAC critical cooling layout', 'HVAC schematic layout'
        ]},
    ]},
];


// =================================================================================
// TASK GENERATION
// =================================================================================
const generateTasksForProject = (projectIndex: number, projectStartDate: Date): Task[] => {
    const tasks: Task[] = [];
    const idMap: Record<string, string> = {};
    let taskCounter = 0;
    const statuses: TaskStatus[] = ['OPEN', 'WIP', 'CLOSED'];

    let currentDayOffset = 0;
    let coreTaskNumber = 1;

    mepTaskTemplate.forEach(coreTaskInfo => {
        const coreTaskId = `t${projectIndex}-${taskCounter++}`;
        const coreTaskName = `${coreTaskNumber}. ${coreTaskInfo.name}`;
        const coreTaskStartDate = addDays(projectStartDate, currentDayOffset);
        const coreTaskEndDate = calculateEndDate(coreTaskStartDate, coreTaskInfo.duration);
        
        idMap[coreTaskInfo.name] = coreTaskId;

        tasks.push({
            id: coreTaskId,
            name: coreTaskName,
            description: `Core deliverables for ${coreTaskInfo.name}.`,
            status: statuses[(projectIndex + taskCounter) % statuses.length],
            startDate: coreTaskStartDate,
            endDate: coreTaskEndDate,
            assignedTo: [MEMBERS[(taskCounter) % MEMBERS.length].id, MEMBERS[(taskCounter + 1) % MEMBERS.length].id],
            assignedBy: projectLeadIds[(projectIndex - 1) % projectLeadIds.length],
            parentId: undefined,
            revision: 0,
        });

        let subTaskNumber = 1;
        coreTaskInfo.subtasks.forEach(subTaskInfo => {
            const subTaskId = `t${projectIndex}-${taskCounter++}`;
            const subTaskName = `${coreTaskNumber}.${subTaskNumber}. ${subTaskInfo.name}`;
            const subTaskStartDate = addDays(coreTaskStartDate, Math.floor(Math.random() * 2));
            const subTaskEndDate = calculateEndDate(subTaskStartDate, subTaskInfo.duration);
            
            idMap[subTaskInfo.name] = subTaskId;

            // Determine dependency
            let dependencyId: string | undefined = undefined;
            if (subTaskInfo.dependsOn) {
                if (Array.isArray(subTaskInfo.dependsOn)) {
                    // find the latest end date among dependencies
                    let latestDepEndDate = new Date(0);
                    subTaskInfo.dependsOn.forEach(depName => {
                        const depTask = tasks.find(t => t.id === idMap[depName]);
                        if(depTask && depTask.endDate > latestDepEndDate) {
                            latestDepEndDate = depTask.endDate;
                            dependencyId = depTask.id;
                        }
                    });
                } else {
                    dependencyId = idMap[subTaskInfo.dependsOn];
                }
            }
            
            tasks.push({
                id: subTaskId,
                name: subTaskName,
                description: `Detailed task for ${subTaskInfo.name}.`,
                status: statuses[(projectIndex + taskCounter) % statuses.length],
                startDate: subTaskStartDate,
                endDate: subTaskEndDate,
                assignedTo: [MEMBERS[(taskCounter) % MEMBERS.length].id],
                assignedBy: designCaptainIds[(projectIndex - 1) % designCaptainIds.length],
                parentId: coreTaskId,
                dependencyId: dependencyId,
                revision: 0,
            });
            subTaskNumber++;
        });

        currentDayOffset += coreTaskInfo.duration + Math.floor(Math.random() * 2); // Stagger core tasks
        coreTaskNumber++;
    });

    return tasks;
};

// =================================================================================
// PROJECTS
// =================================================================================
const projectStages: ProjectStage[] = ['Pitch', 'Design', 'Construction', 'Handover'];

export const PROJECTS: Project[] = Array.from({ length: 6 }, (_, i) => {
  const projectIndex = i + 1;
  const projectStartDate = new Date();
  projectStartDate.setDate(projectStartDate.getDate() + i * 5); // Stagger project start dates

  return {
    id: `proj-${projectIndex}`,
    name: `Project ${projectIndex}`,
    stage: projectStages[i % projectStages.length],
    projectLead: projectLeadIds[i % projectLeadIds.length],
    designCaptain: designCaptainIds[i % designCaptainIds.length],
    tasks: generateTasksForProject(projectIndex, projectStartDate),
  };
});
