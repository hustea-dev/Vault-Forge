import { ObsidianService } from '../services/ObsidianService.js';
import { TEXT } from '../config/text.js';
import { AppMode } from '../types/constants.js';
import { BaseStrategy } from './BaseStrategy.js';
import { PromptSmith } from '../core/PromptSmith.js';
import { TagService } from '../services/TagService.js';
import { AIOrchestratorService } from '../services/AIOrchestratorService.js';
import { ConfigService } from '../services/ConfigService.js';

export class DiaryStrategy extends BaseStrategy {
    protected mode = AppMode.DIARY;
    protected saveInput = false;
    protected shouldProcessResult = false;
    static readonly supportsDetach = false;

    override async execute(
        inputData: string,
        obsidian: ObsidianService,
        promptSmith: PromptSmith,
        aiOrchestrator: AIOrchestratorService,
        configService: ConfigService, 
        fileInfo: { relativePath: string; fullPath: string },
        date: Date,
        instruction?: string,
        overrideModel?: { provider: string; model: string },
        cliOptions?: Record<string, any>
    ): Promise<any> {
        
        let content = inputData;

        const SIZE_LIMIT = 10240;
        if (content && content.length > SIZE_LIMIT) {
            if (cliOptions?.isPiped) {
                await this.ui.error(TEXT.errors.pipedInputTooLarge.replace('{length}', content.length.toString()));
                await this.ui.error(TEXT.errors.pipedInputLimit.replace('{limit}', SIZE_LIMIT.toString()));
                process.exit(1);
            }

            const shouldContinue = await this.ui.askConfirm(
                TEXT.ui.confirmLargeInput.replace('{length}', content.length.toString())
            );

            if (!shouldContinue) {
                await this.ui.cancel(TEXT.ui.operationCancelled);
                process.exit(0);
            }
        }

        if (!content) {
            content = await this.ui.askText(
                TEXT.ui.diaryInputMessage,
                TEXT.ui.diaryInputPlaceholder
            );
        }

        if (!content.trim()) return;

        content = content.replace(/\\n/g, '\n');

        let headerLevel = 0;
        const headerTags = [
            { tag: /#(見出し[1１]|h1)\b/i, level: 1 },
            { tag: /#(見出し[2２]|h2)\b/i, level: 2 },
            { tag: /#(見出し[3３]|h3)\b/i, level: 3 },
            { tag: /#(見出し[4４]|h4)\b/i, level: 4 },
            { tag: /#(見出し[5５]|h5)\b/i, level: 5 },
            { tag: /#(見出し[6６]|h6)\b/i, level: 6 },
        ];

        for (const h of headerTags) {
            if (h.tag.test(content)) {
                headerLevel = h.level;
                content = content.replace(h.tag, '').trim();
                break; 
            }
        }

        let isTask = cliOptions?.task || false;
        if (headerLevel === 0 && /#(task|todo)/i.test(content)) {
            isTask = true;
        }

        if (headerLevel > 0) {
            const prefix = '#'.repeat(headerLevel);
            content = `${prefix} ${content}`;
        } else if (isTask) {
            content = `- [ ] ${content}`;
        }

        const tagService = new TagService(obsidian.getVaultPath());
        const tags = tagService.extractTags(content);
        
        await tagService.updateTagsIndex(tags);
        await obsidian.appendToDailyNote(content, tags, headerLevel > 0);

        return { responseText: TEXT.ui.diarySaved };
    }
}
