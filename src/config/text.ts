import { MESSAGES as JA_MESSAGES } from './locales/ja.js';
import { MESSAGES as EN_MESSAGES } from './locales/en.js';
import { PROMPTS as JA_PROMPTS } from './prompts/ja.js';
import { PROMPTS as EN_PROMPTS } from './prompts/en.js';

const lang = process.env.VF_LANG || process.env.APP_LANG || 'ja';

const JA = {
    ...JA_MESSAGES,
    prompts: JA_PROMPTS
};

const EN = {
    ...EN_MESSAGES,
    prompts: EN_PROMPTS
};

export const TEXT = (lang === 'en' ? EN : JA) as typeof EN;
