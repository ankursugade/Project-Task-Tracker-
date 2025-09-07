'use server';
/**
 * @fileOverview A portfolio summarization AI agent.
 *
 * - summarizeAllProjects - A function that handles the project portfolio summarization process.
 * - SummarizeAllProjectsInput - The input type for the summarizeAllProjects function.
 * - SummarizeAllProjectsOutput - The return type for the summarizeAllProjects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { ProjectStage, TaskStatus } from '@/lib/types';

const ProjectSummarySchema = z.object({
    projectName: z.string().describe('The name of the project.'),
    projectStage: z.custom<ProjectStage>().describe('The current stage of the project.'),
    taskStatuses: z.array(z.custom<TaskStatus>()).describe('An array of all task statuses in the project.'),
    blockedTasks: z.array(z.string()).describe('A list of strings, where each string describes a task that is currently blocked by another.'),
});

const SummarizeAllProjectsInputSchema = z.object({
    projects: z.array(ProjectSummarySchema).describe('An array of all projects to be summarized.'),
});

export type SummarizeAllProjectsInput = z.infer<typeof SummarizeAllProjectsInputSchema>;

const SummarizeAllProjectsOutputSchema = z.object({
  summary: z.string().describe("A one-paragraph summary of the entire project portfolio's current status, health, and velocity. Mention the total number of projects and any trends you observe."),
  hurdles: z.string().describe('A bulleted list of the most critical hurdles or blocked tasks across all projects. If there are no hurdles, state that clearly.'),
  remark: z.string().describe("A concluding one-sentence remark about the entire portfolio's outlook."),
});
export type SummarizeAllProjectsOutput = z.infer<typeof SummarizeAllProjectsOutputSchema>;

export async function summarizeAllProjects(input: SummarizeAllProjectsInput): Promise<SummarizeAllProjectsOutput> {
  return summarizeAllProjectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAllProjectsPrompt',
  input: {schema: SummarizeAllProjectsInputSchema},
  output: {schema: SummarizeAllProjectsOutputSchema},
  prompt: `You are a senior portfolio manager AI. Your task is to provide a clear, concise, and insightful summary of a portfolio of projects for a stakeholder report.

Analyze the following portfolio data:
{{#each projects}}
- Project Name: {{{this.projectName}}}
- Current Stage: {{{this.projectStage}}}
- Task Statuses: {{{json this.taskStatuses}}}
- Blocked Tasks/Hurdles: 
  {{#if this.blockedTasks}}
    {{#each this.blockedTasks}}
    - {{{this}}}
    {{/each}}
  {{else}}
  - None
  {{/if}}

{{/each}}

Based on this data, generate the following output in JSON format:
1.  **summary**: Write a one-paragraph summary of the entire portfolio. Start by stating the portfolio's overall health (e.g., "healthy," "at risk," "needs attention"). Mention the total number of projects and comment on any notable trends in velocity, stage distribution, or task completion.
2.  **hurdles**: Create a markdown bulleted list of the most critical hurdles across all projects. Synthesize common themes if possible. If there are no major hurdles, the value should be "No critical hurdles identified across the portfolio. Projects are progressing as expected."
3.  **remark**: Provide a sharp, concluding one-sentence remark on the portfolio's overall outlook.
`,
});

const summarizeAllProjectsFlow = ai.defineFlow(
  {
    name: 'summarizeAllProjectsFlow',
    inputSchema: SummarizeAllProjectsInputSchema,
    outputSchema: SummarizeAllProjectsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
