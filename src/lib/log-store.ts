// A simple in-memory store for task logs.
// In a real application, you would persist this data.

import type { Task, Member, Project } from "./types";

export type LogEntry = {
  timestamp: Date;
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  previousStatus: Task['status'] | null;
  newStatus: Task['status'];
  changedBy: string; // Member ID
};

const logs: LogEntry[] = [];

export const logStore = {
  add: (entry: Omit<LogEntry, 'timestamp'>) => {
    logs.unshift({ ...entry, timestamp: new Date() });
  },
  getLogs: () => {
    return logs;
  },
  getLogsForProject: (projectId: string) => {
    return logs.filter(log => log.projectId === projectId);
  }
};

