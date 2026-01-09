import { Command } from 'commander';
import { VaultForge } from '../core/VaultForge.js';
import { TEXT } from '../config/text.js';
import { confirm } from '@clack/prompts';
import tabtab from 'tabtab';
import { AppMode } from '../types/constants.js';
import type { VaultForgeConfig } from '../types/interfaces.js';
import { ConfigService } from '../services/ConfigService.js';

export function registerInitCommand(program: Command) {
    program.command('init')
        .description(TEXT.commands.init.description)
        .action(async () => {

            const configService = new ConfigService();
            if (!configService.hasEnvFile()) {
                console.error(TEXT.errors.envMissing);
                process.exit(1);
            } else if (!configService.hasVaultPath()) {
                console.error(TEXT.errors.vaultPathNotSet);
                process.exit(1);
            }

            const config: VaultForgeConfig = {
                vaultPath: configService.vaultPath,
                inputData: "",
                mode: AppMode.INIT,
            };

            const app = new VaultForge(config);
            await app.run();

            console.log('\n');
            const shouldSetupCompletion = await confirm({
                message: TEXT.ui.setupCompletionConfirm,
            });

            if (shouldSetupCompletion) {
                console.log('\n' + TEXT.ui.completionInstallStart);
                console.log(TEXT.ui.completionInstallInfo + '\n');
                
                try {
                    await tabtab.install({
                        name: 'vf',
                        completer: 'vf'
                    });
                } catch (e) {
                    console.error(TEXT.ui.setupCompletionFailed);
                    console.log(TEXT.ui.setupCompletionManual);
                }
            } else {
                console.log(TEXT.ui.setupCompletionManual);
            }
        });
}
