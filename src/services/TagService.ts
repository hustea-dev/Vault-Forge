import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import matter from 'gray-matter';

const execAsync = promisify(exec);

export class TagService {
    private vaultPath: string;
    private tagsCachePath: string;

    constructor(vaultPath: string) {
        this.vaultPath = vaultPath;
        this.tagsCachePath = path.join(vaultPath, '_AI_Prompts', 'tags.json');
    }

    /**
     * tags.jsonを初期化する
     * @returns true if a new file was created
     */
    async initialize(): Promise<boolean> {
        try {
            await fs.access(this.tagsCachePath);
            return false;
        } catch (e) {
            await this.updateTagsIndex([]);
            return true;
        }
    }

    /**
     * テキストからハッシュタグを抽出する
     * Extracts hashtags from the text.
     */
    extractTags(text: string): string[] {
        const regex = /#[\w\u00C0-\u00FF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g;
        const matches = text.match(regex);
        if (!matches) return [];
        return matches.map(tag => tag.substring(1)); // #を除去
    }

    /**
     * Frontmatterのtagsフィールドを更新する
     * Updates the tags field in Frontmatter.
     */
    updateFrontmatterTags(content: string, newTags: string[]): string {
        if (newTags.length === 0) return content;

        const file = matter(content);
        const existingTags = file.data.tags || [];
        
        const currentTags = Array.isArray(existingTags) 
            ? existingTags 
            : (typeof existingTags === 'string' ? [existingTags] : []);

        const mergedTags = Array.from(new Set([...currentTags, ...newTags]));
        
        file.data.tags = mergedTags;
        
        return matter.stringify(file.content, file.data);
    }

    /**
     * タグインデックス(tags.json)を更新する
     * Updates the tag index (tags.json).
     */
    async updateTagsIndex(newTags: string[]): Promise<void> {
        if (newTags.length === 0) return;

        let tags: string[] = [];
        try {
            const data = await fs.readFile(this.tagsCachePath, 'utf-8');
            tags = JSON.parse(data);
        } catch (e) {}

        const updatedTags = Array.from(new Set([...tags, ...newTags]));
        
        await fs.mkdir(path.dirname(this.tagsCachePath), { recursive: true });
        await fs.writeFile(this.tagsCachePath, JSON.stringify(updatedTags, null, 2), 'utf-8');
    }
}
