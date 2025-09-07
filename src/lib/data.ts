
import type { Member, Project, Task, ProjectStage, TaskStatus } from '@/lib/types';
import { addDays, isSaturday, isSunday, startOfDay } from 'date-fns';

// =================================================================================
// UTILITY TO CALCULATE END DATE BASED ON WORKING DAYS
// =================================================================================
function calculateEndDate(startDate: Date, durationDays: number): Date {
  let currentDate = new Date(startDate);
  let daysAdded = 0;
  // durationDays - 1 because the start date counts as the first day.
  while (daysAdded < durationDays - 1) { 
    currentDate = addDays(currentDate, 1);
    if (!isSaturday(currentDate) && !isSunday(currentDate)) {
      daysAdded++;
    }
  }
  return startOfDay(currentDate);
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

const projectLeadIds = ['mem-1', 'mem-2', 'mem-3', 'mem-4', 'mem-5', 'mem-6'];
const designCaptainIds = ['mem-7', 'mem-8', 'mem-1', 'mem-2', 'mem-3', 'mem-4'];

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
        { name: 'PHE & FF DBR Update', duration: 2, dependsOn: 'Electrical DBR Update' },
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
    // --- CORE: PHE & FF TENDER ---
    { core: true, name: 'PHE & FF TENDER', duration: 6, subtasks: [
        { name: 'Water Supply & Drainage Schematic', duration: 3, dependsOn: 'PHE & FF DBR Update' },
        { name: 'Water Supply Layout', duration: 3, dependsOn: 'Water Supply & Drainage Schematic' },
        { name: 'Drainage Layout', duration: 3, dependsOn: 'Water Supply & Drainage Schematic' },
        { name: 'Fire Fighting (Hydrant & Sprinkler) Layout', duration: 3, dependsOn: 'Water Supply & Drainage Schematic' },
        { name: 'PHE & FF Tender BOQ', duration: 2, dependsOn: [
            'Water Supply Layout', 'Drainage Layout', 'Fire Fighting (Hydrant & Sprinkler) Layout'
        ]},
    ]},
    // --- CORE: IBMS & ELV TENDER ---
    { core: true, name: 'IBMS & ELV TENDER', duration: 6, subtasks: [
        { name: 'IBMS & ELV System Architecture', duration: 3, dependsOn: 'IBMS & ELV Update' },
        { name: 'CCTV & ACS Layout', duration: 3, dependsOn: 'IBMS & ELV System Architecture' },
        { name: 'Fire Alarm & PA System Layout', duration: 3, dependsOn: 'IBMS & ELV System Architecture' },
        { name: 'IBMS & ELV Tender BOQ', duration: 2, dependsOn: [
            'CCTV & ACS Layout', 'Fire Alarm & PA System Layout'
        ]},
    ]},
    // --- CORE: IT PASSIVE TENDER ---
    { core: true, name: 'IT PASSIVE TENDER', duration: 5, subtasks: [
        { name: 'IT Passive System Architecture', duration: 2, dependsOn: 'IT Passive DBR Update' },
        { name: 'IT Passive Containment Layout', duration: 3, dependsOn: 'IT Passive System Architecture' },
        { name: 'Server & Rack Layout', duration: 2, dependsOn: 'IT Passive Containment Layout' },
        { name: 'IT Passive Tender BOQ', duration: 2, dependsOn: [
            'IT Passive Containment Layout', 'Server & Rack Layout'
        ]},
    ]},
];


// =================================================================================
// TASK GENERATION
// =================================================================================
const generateTasksForProject = (projectIndex: number): Task[] => {
    const tasks: Task[] = [];
    const idMap: Record<string, string> = {};
    let taskCounter = 0;
    const statuses: TaskStatus[] = ['OPEN', 'WIP', 'CLOSED'];
    
    // Use a fixed start date to prevent hydration mismatches
    const baseStartDate = new Date('2025-09-01T00:00:00Z');
    const projectStartDate = addDays(baseStartDate, projectIndex * 7);

    let currentDayOffset = 0;
    let coreTaskNumber = 1;

    mepTaskTemplate.forEach((coreTaskInfo, coreIndex) => {
        const coreTaskId = `t${projectIndex}-${taskCounter++}`;
        const coreTaskName = `${coreTaskNumber}. ${coreTaskInfo.name}`;
        
        let coreTaskStartDate = addDays(startOfDay(projectStartDate), currentDayOffset);
        // Ensure start date is not on a weekend
        while(isSaturday(coreTaskStartDate) || isSunday(coreTaskStartDate)) {
            coreTaskStartDate = addDays(coreTaskStartDate, 1);
        }
        
        const coreTaskEndDate = calculateEndDate(coreTaskStartDate, coreTaskInfo.duration);
        
        idMap[coreTaskInfo.name] = coreTaskId;

        tasks.push({
            id: coreTaskId,
            name: coreTaskName,
            description: `Core deliverables for ${coreTaskInfo.name}.`,
            status: statuses[(projectIndex + coreIndex) % statuses.length],
            startDate: coreTaskStartDate,
            endDate: coreTaskEndDate,
            assignedTo: [MEMBERS[(coreIndex) % MEMBERS.length].id, MEMBERS[(coreIndex + 1) % MEMBERS.length].id],
            assignedBy: projectLeadIds[(projectIndex) % projectLeadIds.length],
            parentId: undefined,
            revision: 0,
        });

        let subTaskNumber = 1;
        coreTaskInfo.subtasks.forEach((subTaskInfo, subIndex) => {
            const subTaskId = `t${projectIndex}-${taskCounter++}`;
            const subTaskName = `${coreTaskNumber}.${subTaskNumber}. ${subTaskInfo.name}`;
            
            let subTaskStartDate = addDays(startOfDay(coreTaskStartDate), subIndex % 2); // Stagger sub-tasks a bit
             while(isSaturday(subTaskStartDate) || isSunday(subTaskStartDate)) {
                subTaskStartDate = addDays(subTaskStartDate, 1);
            }

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
                status: statuses[(projectIndex + subIndex) % statuses.length],
                startDate: subTaskStartDate,
                endDate: subTaskEndDate,
                assignedTo: [MEMBERS[(subIndex) % MEMBERS.length].id],
                assignedBy: designCaptainIds[(projectIndex) % designCaptainIds.length],
                parentId: coreTaskId,
                dependencyId: dependencyId,
                revision: 0,
            });
            subTaskNumber++;
        });

        currentDayOffset += coreTaskInfo.duration + (coreIndex % 2); // Stagger core tasks
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
  
  return {
    id: `proj-${projectIndex}`,
    name: `Project ${projectIndex}`,
    stage: projectStages[i % projectStages.length],
    projectLead: projectLeadIds[i % projectLeadIds.length],
    designCaptain: designCaptainIds[i % designCaptainIds.length],
    tasks: generateTasksForProject(projectIndex),
  };
});
