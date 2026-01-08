import { mainAction } from '../../src/lib/mainAction.js';
import { AppMode } from '../../src/types/constants.js';

// E2Eテストではパイプ入力を待機しないように、TTYとして振る舞わせる
Object.defineProperty(process.stdin, 'isTTY', { value: true });

async function run() {
    try {
        const args = process.argv.slice(2);
        const action = args[0];

        switch (action) {
            case 'ai':
                await mainAction(args[1], { preset: AppMode.GENERAL }); // strategy -> preset
                break;
            case 'diary':
                await mainAction(args[1], { preset: AppMode.DIARY }); // strategy -> preset
                break;
            default:
                console.error(`Unknown action for E2E runner: ${action}`);
                process.exit(1);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
