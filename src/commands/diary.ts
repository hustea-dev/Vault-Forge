import { Command } from 'commander';
import { mainAction } from '../lib/mainAction.js';
import { AppMode } from '../types/constants.js';

export function registerDiaryCommand(program: Command) {
    program.command('diary')
        .alias('d')
        .argument('[input...]')
        .option('-t, --task')
        .option('-d, --detach')
        .allowUnknownOption()
        .action(async (parts, opts) => {
            await mainAction(parts.join(' '), { ...opts, preset: AppMode.DIARY });
        });
}
