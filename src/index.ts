#!/usr/bin/env node
import { Command } from 'commander';
import { registerCompletionCommand, setupCompletion } from './commands/completion.js';
import { registerInitCommand } from './commands/init.js';
import { registerAiCommand } from './commands/ai.js';
import { registerDiaryCommand } from './commands/diary.js';
import { registerSearchCommand } from './commands/search.js';
import { registerTagCommand } from './commands/tag.js';
import { TEXT } from './config/text.js';

if (setupCompletion()) {
    process.exit(0);
}

const program = new Command();

program
    .name('vf')
    .description(TEXT.appDescription)
    .version('2.0.0');

registerCompletionCommand(program);
registerInitCommand(program);
registerAiCommand(program);
registerDiaryCommand(program);
registerSearchCommand(program);
registerTagCommand(program);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}

program.parse(process.argv);
