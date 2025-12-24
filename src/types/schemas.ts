import { z } from 'zod';

export const PromptFileSchema = z.object({
    frontmatter: z.object({
        description: z.string().optional(),
        version: z.number().optional(),
        tags: z.array(z.string()).optional(),
    }).optional(),
    
    content: z.string().min(10, "プロンプトが短すぎます (10文字以上必要です)"),
});

export type PromptFile = z.infer<typeof PromptFileSchema>;
