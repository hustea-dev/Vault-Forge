import { z } from 'zod';

export const PromptFileSchema = z.object({
    frontmatter: z.object({
        description: z.string().optional(),
        version: z.number().optional(),
        tags: z.array(z.string()).optional().nullable(),
        aiProvider: z.string().optional(),
        model: z.string().optional(),
        outputMode: z.enum(['normal', 'stream', 'background']).optional(),
    }).optional(),
    
    content: z.string().min(10, "Prompt is too short (at least 10 characters required)"),
});

export type PromptFile = z.infer<typeof PromptFileSchema>;
