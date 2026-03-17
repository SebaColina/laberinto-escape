'use server';
/**
 * @fileOverview A Genkit flow for generating custom maze parameters based on a text prompt.
 *
 * - generateCustomMaze - A function that generates parameters for a new maze.
 * - GenerateCustomMazeInput - The input type for the generateCustomMaze function.
 * - GenerateCustomMazeOutput - The return type for the generateCustomMaze function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCustomMazeInputSchema = z.object({
  description: z.string().describe('A text prompt describing the desired characteristics of the maze (e.g., complexity, style, theme).'),
});
export type GenerateCustomMazeInput = z.infer<typeof GenerateCustomMazeInputSchema>;

const GenerateCustomMazeOutputSchema = z.object({
  rows: z.number().int().min(10).max(50).describe('The number of rows in the maze grid.'),
  cols: z.number().int().min(10).max(50).describe('The number of columns in the maze grid.'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'extreme']).describe('The overall difficulty of the maze.'),
  style: z.enum(['classic', 'winding', 'sparse', 'dense', 'geometric', 'organic']).describe('The visual and structural style of the maze.'),
  theme: z.string().describe('A descriptive theme for the maze, influencing its aesthetic and colors.'),
  startColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).describe('Hex color code for the maze start point.'),
  goalColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).describe('Hex color code for the maze goal point.'),
  wallColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).describe('Hex color code for the maze walls.'),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).describe('Hex color code for the maze background.'),
});
export type GenerateCustomMazeOutput = z.infer<typeof GenerateCustomMazeOutputSchema>;

export async function generateCustomMaze(input: GenerateCustomMazeInput): Promise<GenerateCustomMazeOutput> {
  return generateCustomMazeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCustomMazePrompt',
  input: { schema: GenerateCustomMazeInputSchema },
  output: { schema: GenerateCustomMazeOutputSchema },
  prompt: `You are an AI assistant specialized in generating parameters for unique and diverse mazes based on user descriptions.\n  \n  The user will provide a description of the desired maze. Your task is to output a JSON object containing specific parameters that define the maze's structure and aesthetics.\n  \n  Based on the user's description, determine appropriate values for the following fields:\n  - 'rows': An integer between 10 and 50 for the number of rows.\n  - 'cols': An integer between 10 and 50 for the number of columns.\n  - 'difficulty': Choose from 'easy', 'medium', 'hard', or 'extreme'.\n  - 'style': Choose from 'classic', 'winding', 'sparse', 'dense', 'geometric', or 'organic'.\n  - 'theme': A short textual description of the maze's visual theme (e.g., 'neon', 'ancient ruins', 'digital grid').\n  - 'startColor': A hex color code (e.g., #FF0000) for the maze's starting point.\n  - 'goalColor': A hex color code (e.g., #00FF00) for the maze's goal point.\n  - 'wallColor': A hex color code (e.g., #FFFFFF) for the maze's walls.\n  - 'backgroundColor': A hex color code (e.g., #000000) for the maze's background.\n\n  Ensure that 'rows' and 'cols' are roughly similar, but can vary.\n  Make sure the chosen colors are cohesive with the 'theme' and the overall design.\n\n  User description: "{{{description}}}"\n  `,
});

const generateCustomMazeFlow = ai.defineFlow(
  {
    name: 'generateCustomMazeFlow',
    inputSchema: GenerateCustomMazeInputSchema,
    outputSchema: GenerateCustomMazeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate maze parameters.');
    }
    return output;
  }
);
