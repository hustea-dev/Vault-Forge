export const AppMode = {
    GENERAL: 'general',
    X_POST: 'xpost',
    DEBUG: 'debug'
} as const;

export type AppMode = typeof AppMode[keyof typeof AppMode];

export const AIProvider = {
    GEMINI: 'gemini',
    OPENAI: 'openai'
} as const;

export type AIProvider = typeof AIProvider[keyof typeof AIProvider];
