import { ObsidianService } from '../services/ObsidianService.js';
import { ConfigService } from '../services/ConfigService.js';
import { TEXT } from '../config/text.js';
import { select, isCancel, cancel } from '@clack/prompts';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

async function checkRipgrepAvailability(): Promise<boolean> {
    try {
        await execAsync('rg --version');
        return true;
    } catch (e) {
        return false;
    }
}

export async function search(query: string, obsidian: ObsidianService, config: ConfigService) {
    const hasRipgrep = await checkRipgrepAvailability();

    if (hasRipgrep) {
        await searchWithRipgrep(query, obsidian, config);
    } else {
        await searchWithObsidianUri(query, obsidian);
    }
}

async function searchWithRipgrep(query: string, obsidian: ObsidianService, config: ConfigService) {
    const vaultPath = obsidian.getVaultPath();
    console.log(TEXT.logs.searchingWithRipgrep.replace('{query}', query));
    
    try {
        const { stdout } = await execAsync(`rg -i --vimgrep -g '*.md' "${query}" "${vaultPath}"`);
        
        const lines = stdout.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            console.log(TEXT.logs.noResultsFound);
            return;
        }

        const choices = lines.map(line => {
            const parts = line.split(':');
            if (parts.length < 4) return null;
            
            const filePath = parts[0];
            const lineNum = parts[1];
            const content = parts.slice(3).join(':').trim();
            
            if (!filePath) return null;

            const relativePath = filePath.replace(vaultPath + '/', '');

            return {
                name: `${relativePath}:${lineNum}  ${content.substring(0, 60)}...`,
                value: filePath,
                description: content
            };
        }).filter(c => c !== null);

        const selectedFile = await select({
            message: TEXT.ui.searchResultsFound.replace('{count}', choices.length.toString()),
            options: choices as any,
        });

        if (isCancel(selectedFile)) {
            cancel(TEXT.ui.operationCancelled);
            return;
        }

        if (config.editor) {
            await obsidian.openFileInEditor(selectedFile as string);
        } else {
            await obsidian.openFileInObsidian(selectedFile as string);
        }

    } catch (e: any) {
        if (e.code === 1) {
            console.log(TEXT.logs.noResultsFound);
        } else {
            console.error(`${TEXT.errors.searchError} ${e.message}`);
        }
    }
}

async function searchWithObsidianUri(query: string, obsidian: ObsidianService) {
    const vaultPath = obsidian.getVaultPath();
    console.log(TEXT.logs.ripgrepNotFoundOpeningObsidian);
    
    const vaultName = path.basename(vaultPath);
    const encodedQuery = encodeURIComponent(query);
    const uri = `obsidian://search?vault=${vaultName}&query=${encodedQuery}`;
    
    const openCommand = process.platform === 'darwin' ? 'open'
        : (process.platform === 'win32' ? 'start' : 'xdg-open');
    await execAsync(`${openCommand} "${uri}"`);
}
