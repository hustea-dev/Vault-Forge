import { ObsidianService } from '../services/ObsidianService.ts';
import { AppMode } from '../types/constants.ts';
import { BaseStrategy } from './BaseStrategy.ts';

export class DebugStrategy extends BaseStrategy {
    protected mode = AppMode.DEBUG;

    protected override async processResult(
        responseText: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<void> {
        await obsidian.appendAnalysisResult(fileInfo.relativePath, responseText, this.mode);
    }
}
