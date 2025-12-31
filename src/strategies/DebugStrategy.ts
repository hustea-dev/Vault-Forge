import { ObsidianService } from '../services/ObsidianService.ts';
import { AppMode } from '../types/constants.ts';
import { BaseStrategy } from './BaseStrategy.ts';
import { TEXT } from '../config/text.ts';

export class DebugStrategy extends BaseStrategy {
    protected mode = AppMode.DEBUG;
    protected saveInput = true;

    protected override async processResult(
        responseText: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<void> {
        const header = `${TEXT.markdown.analysisHeader} (${this.mode})`;
        await obsidian.appendAnalysisResult(fileInfo.relativePath, responseText, header);
    }
}
