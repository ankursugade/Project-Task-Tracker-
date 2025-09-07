'use server';
/**
 * @fileOverview A project summarization AI agent.
 *
 * - summarizeProject - A function that handles the project summarization process.
 * - SummarizeProjectInput - The input type for the summarizeProject function.
 * - SummarizeProjectOutput - The return type for the summarizeProject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { ProjectStage, TaskStatus } from '@/lib/types';

const SummarizeProjectInputSchema = z.object({
    projectName: z.string().describe('The name of the project.'),
    projectStage: z.custom<ProjectStage>().describe('The current stage of the project.'),
    taskStatuses: z.array(z.custom<TaskStatus>()).describe('An array of all task statuses in the project.'),
    blockedTasks: z.array(z.string()).describe('A list of strings, where each string describes a task that is currently blocked by another.'),
});

export type SummarizeProjectInput = z.infer<typeof SummarizeProjectInputSchema>;

const SummarizeProjectOutputSchema = z.object({
  summary: z.string().describe('A one-paragraph summary of the project\'s current status, health, and velocity. Mention the number of open, in-progress, and closed tasks.'),
  hurdles: z.string().describe('A bulleted list of the most critical hurdles or blocked tasks. If there are no hurdles, state that clearly.'),
  remark: z.string().describe('A concluding one-sentence remark about the project\'s outlook.'),
});
export type SummarizeProjectOutput = z.infer<typeof SummarizeProjectOutputSchema>;

export async function summarizeProject(input: SummarizeProjectInput): Promise<SummarizeProjectOutput> {
  return summarizeProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProjectPrompt',
  input: {schema: SummarizeProjectInputSchema},
  output: {schema: SummarizeProjectOutputSchema},
  prompt: `You are a senior project manager AI. Your task is to provide a clear, concise, and insightful summary of a project's status for a stakeholder report.

Analyze the following project data:
- Project Name: {{{projectName}}}
- Current Stage: {{{projectStage}}}
- Task Statuses: {{{json taskStatuses}}}
- Blocked Tasks/Hurdles: 
{{#if blockedTasks}}
  {{#each blockedTasks}}
  - {{{this}}}
  {{/each}}
{{else}}
- None
{{/if}}

Based on this data, generate the following output in JSON format:
1.  **summary**: Write a one-paragraph summary. Start by stating the project's health (e.g., "healthy," "at risk," "needs attention"). Mention the total number of tasks and the counts for OPEN, WIP, and CLOSED statuses. Comment on the project's velocity and current state relative to its stage.
2.  **hurdles**: Create a markdown bulleted list of the most critical hurdles based on the provided list. If there are no hurdles, the value should be "No immediate hurdles identified. The project is on track."
3.  **remark**: Provide a sharp, concluding one-sentence remark on the project's overall outlook. Be encouraging if things are good, or cautionary if there are risks.
`,
});

const summarizeProjectFlow = ai.defineFlow(
  {
    name: 'summarizeProjectFlow',
    inputSchema: SummarizeProjectInputSchema,
    outputSchema: SummarizeProjectOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
