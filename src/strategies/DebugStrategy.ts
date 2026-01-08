import { ObsidianService } from '../services/ObsidianService.js';
import { TEXT } from '../config/text.js';
import { AppMode } from '../types/constants.js';
import { BaseStrategy } from './BaseStrategy.js';

export class DebugStrategy extends BaseStrategy {
    protected mode = AppMode.DEBUG;
    protected saveInput = true;
    protected shouldProcessResult = true;
    static readonly supportsDetach = true;

    protected async handleResult(
        responseText: string, 
        obsidian: ObsidianService, 
        fileInfo: { relativePath: string; fullPath: string }
    ): Promise<void> {
        const header = `${TEXT.markdown.analysisHeader} (${this.mode})`;
        await obsidian.appendAnalysisResult(fileInfo.relativePath, responseText, header);
        
        await this.ui.success(TEXT.logs.obsidianAppended);
    }
}
