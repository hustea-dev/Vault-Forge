import { Command } from 'commander';
import { ObsidianService } from '../services/ObsidianService.js';
import { ConfigService } from '../services/ConfigService.js';
import { TEXT } from '../config/text.js';
import { search } from '../lib/search.js';

export function registerSearchCommand(program: Command) {
    program.command('search')
        .alias('s')
        .argument('<query...>')
        .allowUnknownOption()
        .action(async (parts) => {
            const query = parts.join(' ');
            if (!query) {
                console.error(TEXT.errors.noInput);
                return;
            }

            const config = new ConfigService();
            try {
                const vaultPath = config.vaultPath;
                const obsidian = new ObsidianService(vaultPath);
                await search(query, obsidian, config);
            } catch (e: any) {
                console.error(e.message);
                return;
            }
        });
}
