import * as path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';
import { PromptFileSchema } from '../types/schemas.ts';
import { DEFAULT_PROMPTS } from '../templates/defaultPrompt.ts';
import { TEXT } from '../config/text.ts';
import { ObsidianService } from '../services/ObsidianService.ts';

export class PromptLoader {
    private obsidian: ObsidianService;
    private lang: string;

    constructor(obsidian: ObsidianService, lang: string) {
        this.obsidian = obsidian;
        this.lang = lang;
    }

    /**
     * プロンプトファイルを読み込む
     * @param promptName プロンプト名 (例: "general", "xpost")
     * @returns プロンプト本文
     */
    async load(promptName: string): Promise<string> {
        const relativePath = path.join('_AI_Prompts', 'prompts', this.lang, `${promptName}.md`);

        try {
            const fileContent = await this.obsidian.readNote(relativePath);
            const { content, data } = matter(fileContent);

            const validated = PromptFileSchema.parse({
                frontmatter: data,
                content: content.trim()
            });
            return validated.content;

        } catch (error: any) {
            if (error.code === 'ENOENT') {
                const defaultContent = DEFAULT_PROMPTS[promptName];
                if (defaultContent) {
                    await this.obsidian.createNote(relativePath, defaultContent);
                    
                    const logMessage = TEXT.loader.createdDefaultFile.replace('{filePath}', relativePath);
                    console.log(`ℹ️  ${logMessage}`);

                    const { content } = matter(defaultContent);
                    return content.trim();
                }
                const errorMessage = TEXT.loader.noDefaultPrompt.replace('{promptName}', promptName);
                throw new Error(errorMessage);
            }
            
            if (error instanceof z.ZodError) {
                const contentError = error.issues.find(issue =>
                    issue.path.includes('content') && issue.code === 'too_small'
                );

                if (contentError) {
                    const errorMessage = TEXT.loader.loadErrorDetail.replace('{filePath}', relativePath);
                    throw new Error(`${errorMessage}\n${TEXT.loader.reason}: ${TEXT.validation.promptTooShort}`);
                }
            }
            
            const errorMessage = TEXT.loader.loadErrorDetail.replace('{filePath}', relativePath);
            throw new Error(`${errorMessage}\n${TEXT.loader.reason}: ${error.message}`);
        }
    }
}
