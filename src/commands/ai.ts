import { Command } from 'commander';
import { mainAction } from '../lib/mainAction.js';
import { AppMode } from '../types/constants.js';
import { TEXT } from '../config/text.js';

export function registerAiCommand(program: Command) {
    program.command('ai')
        .argument('[input...]')
        .option('-p, --preset <preset>', TEXT.commands.ai.options.preset)
        .option('-i, --instruction <instruction>', TEXT.commands.ai.options.instruction)
        .option('-d, --detach', TEXT.commands.ai.options.detach)
        .option('-m, --model <model>', TEXT.commands.ai.options.model)
        .option('-f, --file <path>', TEXT.commands.ai.options.file)
        .option('--stream', TEXT.commands.ai.options.stream)
        .option('--normal', TEXT.commands.ai.options.normal)
        .allowUnknownOption()
        .action(async (parts: string[], opts: any) => {
            await mainAction(parts.join(' '), opts);
        });
}
