import { spawn, type ChildProcess } from 'child_process';
import { VaultForge } from '../core/VaultForge.js';
import { AppMode } from '../types/constants.js';
import type { VaultForgeConfig } from '../types/interfaces.js';
import { getTags } from '../commands/completion.js';
import { readStdin } from './stdin.js';
import { TEXT } from '../config/text.js';
import { ConfigService } from '../services/ConfigService.js';
import * as fs from 'fs/promises';

/**
 * CLIからの入力を解析し、VaultForgeの実行を準備・トリガーするメインアクション。
 * Parses input from the CLI, prepares, and triggers the execution of VaultForge.
 * @param {string | undefined} inputArg - コマンドライン引数として渡された入力テキスト / Input text passed as a command-line argument.
 * @param {any} options - commanderから渡されるオプションオブジェクト / Options object passed from commander.
 */
export async function mainAction(inputArg: string | undefined, options: any) {
    try {
        if (options.detach && options.stream) {
            console.error(TEXT.errors.optionConflict.replace('{option1}', '--stream').replace('{option2}', '--detach'));
            process.exit(1);
        }
        if (options.detach && options.normal) {
            console.error(TEXT.errors.optionConflict.replace('{option1}', '--normal').replace('{option2}', '--detach'));
            process.exit(1);
        }
        if (options.stream && options.normal) {
            console.error(TEXT.errors.optionConflict.replace('{option1}', '--stream').replace('{option2}', '--normal'));
            process.exit(1);
        }

        let mode = (options.preset as AppMode) || AppMode.GENERAL;

        const configService = new ConfigService();

        if (!configService.hasEnvFile()) {
            console.error(TEXT.errors.envMissing);
            console.error(TEXT.ui.runInit);
            process.exit(1);
        } else if (!configService.hasVaultPath()) {
            console.error(TEXT.errors.vaultPathNotSet);
            console.error(TEXT.ui.runInit);
            process.exit(1);
        }

        const vaultPath = configService.vaultPath;

        if (options.detach) {
            if (!VaultForge.supportsDetach(mode)) {
                console.error(TEXT.errors.detachNotSupported.replace('{mode}', mode));
                process.exit(1);
            }

            const args = process.argv.slice(2).filter(arg => arg !== '-d' && arg !== '--detach');
            const subprocess = spawn(process.argv[0] || 'node', [process.argv[1] || '', ...args], { 
                detached: true, 
                stdio: 'ignore',
                env: {
                    ...process.env,
                    VF_DETACHED_MODE: 'true'
                }
            }) as ChildProcess;
            subprocess.unref();
            process.exit(0);
        }

        const validCandidates = getTags();
        const shouldAutoTag = options.autoTag !== false;

        let finalInputData = "";
        let finalInstruction = options.instruction || "";
        
        const { data: stdinData, isPiped } = await readStdin();

        if (isPiped) {
            finalInputData = stdinData;
            if (inputArg && inputArg.trim()) {
                if (finalInstruction) {
                    finalInstruction += `\n${inputArg}`;
                } else {
                    finalInstruction = inputArg;
                }
            }
        } else if (options.file) {
            try {
                finalInputData = await fs.readFile(options.file, 'utf-8');
                if (inputArg && inputArg.trim()) {
                    if (finalInstruction) {
                        finalInstruction += `\n${inputArg}`;
                    } else {
                        finalInstruction = inputArg;
                    }
                }
            } catch (e: any) {
                console.error(`${TEXT.errors.fileReadError} ${options.file}`);
                process.exit(1);
            }
        } else {
            finalInputData = (inputArg || "").split(' ').map(word => {
                if (shouldAutoTag && validCandidates.includes(word)) {
                    return `#${word}`;
                }
                return word;
            }).join(' ');
        }

        if (!finalInputData.trim() && !finalInstruction && mode !== AppMode.DIARY && mode !== AppMode.INIT) {
        }

        let overrideOutputMode: 'normal' | 'stream' | undefined = undefined;
        if (options.stream) {
            overrideOutputMode = 'stream';
        } else if (options.normal) {
            overrideOutputMode = 'normal';
        }

        const config: VaultForgeConfig = {
            vaultPath: vaultPath,
            inputData: finalInputData,
            mode: mode,
            instruction: finalInstruction,
            cliOptions: options,
            isPiped: isPiped
        };

        const app = new VaultForge(config);
        await app.run();

    } catch (e: any) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error(`${TEXT.errors.mainActionError} ${errorMessage}`);
        process.exit(1);
    }
}
