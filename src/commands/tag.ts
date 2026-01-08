import { Command } from 'commander';
import { ObsidianService } from '../services/ObsidianService.js';
import { ConfigService } from '../services/ConfigService.js';
import { TEXT } from '../config/text.js';
import { search } from '../lib/search.js';
import { getTags } from './completion.js';

export function registerTagCommand(program: Command) {
    program.command('tag')
        .alias('t')
        .argument('<query...>')
        .allowUnknownOption()
        .action(async (parts) => {
            if (parts.length === 0) {
                console.error(TEXT.errors.noInput);
                return;
            }

            const config = new ConfigService();
            try {
                const vaultPath = config.vaultPath;
                const validCandidates = getTags();
                
                const query = parts.map((word: string) => {
                    if (word.startsWith('#')) return word;
                    if (validCandidates.includes(word)) return `#${word}`;
                    return `#${word}`;
                }).join(' ');
                
                const obsidian = new ObsidianService(vaultPath);
                await search(query, obsidian, config);
            } catch (e: any) {
                console.error(e.message);
                return;
            }
        });
}
