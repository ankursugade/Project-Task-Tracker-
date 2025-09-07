// A simple in-memory, client-side store for application data.
// This is a basic simulation of a database for prototyping purposes.

import type { Project, Member, Task } from './types';
import { PROJECTS as initialProjects, MEMBERS as initialMembers } from './data';

interface AppStore {
  projects: Project[];
  members: Member[];
}

// Initialize the store with data from data.ts
const store: AppStore = {
  projects: initialProjects,
  members: initialMembers,
};

// Functions to interact with the store. In a real app, these would be API calls.

export const projectStore = {
  getProjects: (): Project[] => {
    return store.projects;
  },
  getProjectById: (id: string): Project | undefined => {
    return store.projects.find(p => p.id === id);
  },
  addProject: (project: Project): void => {
    // Add to the beginning of the list
    store.projects.unshift(project);
  },
  updateProject: (updatedProject: Project): void => {
    store.projects = store.projects.map(p => p.id === updatedProject.id ? updatedProject : p);
  },
  getAllTasks: (): Task[] => {
    return store.projects.flatMap(p => p.tasks);
  },
};

export const memberStore = {
  getMembers: (): Member[] => {
    return store.members;
  },
  getMemberById: (id: string): Member | undefined => {
    return store.members.find(m => m.id === id);
  },
  addMember: (member: Member): void => {
    store.members.unshift(member);
  },
};
