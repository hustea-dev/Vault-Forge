export const AppMode = {
    GENERAL: 'general',
    DEBUG: 'debug',
    X_POST: 'xpost',
    DIARY: 'diary',
    INIT: 'init',
} as const;

export type AppMode = typeof AppMode[keyof typeof AppMode];

export const AIProvider = {
    GEMINI: 'gemini',
    OPENAI: 'openai',
    GROQ: 'groq',
    CLAUDE: 'claude',
} as const;

export type AIProvider = typeof AIProvider[keyof typeof AIProvider];
