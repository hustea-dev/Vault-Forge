import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import { VaultForge } from './core/VaultForge.ts';
import { AppMode } from './types/constants.ts';
import { TEXT } from './config/text.ts';
import type { VaultForgeConfig } from './types/interfaces.ts';
import { AIServiceFactory } from './services/ai/AIServiceFactory.ts';

dotenv.config();

/**
 * ユーザーの入力を解決する
 */
async function resolveInput(args: string[]) {
    const fileArg = args.find(arg => arg.startsWith('--file='));
    let filePath = fileArg ? fileArg.split('=')[1] : undefined;
    
    const positionalArgs = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'));

    if (!filePath && positionalArgs.length > 0) {
        filePath = positionalArgs[0];
    }

    const instructionArg = args.find(arg =>
        arg.startsWith('--instruction=') || 
        arg.startsWith('--inst=') || 
        arg.startsWith('-i=')
    );
    let instruction = instructionArg ? instructionArg.split('=')[1] : undefined;

    let inputData = "";
    if (filePath) {
        try {
            await fs.access(filePath);
            inputData = await fs.readFile(filePath, 'utf-8');
        } catch (e) {
            const textInput = filePath;
            filePath = undefined;

            const stdinData = await readStdin().catch(() => "");
            
            if (stdinData) {
                inputData = stdinData;
                if (!instruction) {
                    instruction = textInput;
                }
            } else {
                inputData = textInput;
                
                if (!instruction && positionalArgs.length >= 2) {
                    instruction = positionalArgs[1];
                }
            }
        }
    } else {
        inputData = await readStdin().catch(() => "");
    }

    return { inputData, filePath, instruction };
}

async function readStdin(): Promise<string> {
    if (process.stdin.isTTY) return "";
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
}

function validateMode(modeInput: string | undefined): AppMode {
    if (!modeInput) return AppMode.GENERAL;
    const validModes = Object.values(AppMode) as string[];
    if (validModes.includes(modeInput)) {
        return modeInput as AppMode;
    }
    console.error(`${TEXT.errors.invalidMode} '${modeInput}'`);
    console.error(`${TEXT.errors.availableModes}: ${validModes.join(', ')}`);
    process.exit(1);
}

(async () => {
    try {
        const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
        if (!vaultPath) {
            throw new Error(TEXT.errors.envMissing);
        }

        const { aiProvider, apiKey } = AIServiceFactory.resolveConfig();
        const args = process.argv.slice(2);
        const { inputData, filePath, instruction } = await resolveInput(args);
        const modeArg = args.find(arg => arg.startsWith('--mode='));
        const mode = validateMode(modeArg ? modeArg.split('=')[1] : undefined);

        if (!inputData.trim()) {
            throw new Error(TEXT.errors.noInput);
        }

        const config: VaultForgeConfig = {
            apiKey,
            vaultPath,
            inputData,
            mode,
            instruction,
            filePath,
            aiProvider
        };

        const app = new VaultForge(config);
        await app.run();

    } catch (e: any) {
        console.error(TEXT.errors.executionError, e.message);
        process.exit(1);
    }
})();
