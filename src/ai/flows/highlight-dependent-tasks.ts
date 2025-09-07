'use server';

/**
 * @fileOverview A flow to determine if a task should be highlighted based on the status of its dependent task.
 *
 * - highlightDependentTasks - A function that determines whether a task should be highlighted.
 * - HighlightDependentTasksInput - The input type for the highlightDependentTasks function.
 * - HighlightDependentTasksOutput - The return type for the highlightDependentTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HighlightDependentTasksInputSchema = z.object({
  currentTaskStatus: z
    .enum(['OPEN', 'WIP', 'CLOSED'])
    .describe('The status of the current task.'),
  previousTaskStatus: z
    .enum(['OPEN', 'WIP', 'CLOSED'])
    .describe('The status of the previous task.'),
});
export type HighlightDependentTasksInput = z.infer<
  typeof HighlightDependentTasksInputSchema
>;

const HighlightDependentTasksOutputSchema = z.object({
  shouldHighlight: z
    .boolean()
    .describe(
      'Whether the current task should be highlighted (true) or not (false).'    )
});
export type HighlightDependentTasksOutput = z.infer<
  typeof HighlightDependentTasksOutputSchema
>;

export async function highlightDependentTasks(
  input: HighlightDependentTasksInput
): Promise<HighlightDependentTasksOutput> {
  return highlightDependentTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'highlightDependentTasksPrompt',
  input: {schema: HighlightDependentTasksInputSchema},
  output: {schema: HighlightDependentTasksOutputSchema},
  prompt: `You are a project management assistant.  You will determine if a task should be highlighted based on its status and the status of the task it depends on.  If the current task depends on a previous task that is either OPEN or WIP, then the current task should be highlighted so the project manager knows it is blocked.

Given the current task status of {{{currentTaskStatus}}} and the previous task status of {{{previousTaskStatus}}}, determine if the current task should be highlighted. Return true if it should be highlighted, and false if it should not.`,    
});

const highlightDependentTasksFlow = ai.defineFlow(
  {
    name: 'highlightDependentTasksFlow',
    inputSchema: HighlightDependentTasksInputSchema,
    outputSchema: HighlightDependentTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
