import { TEXT } from '../config/text.js';
import type {NoteData} from '../types/interfaces.js';

export const createNoteContent = (data: NoteData): string => {
    return `---
date: ${data.date.toLocaleString()}
mode: ${data.mode}
tags: ["ai/output", "terminal/pipe"]
---

${TEXT.markdown.originalDataHeader}
\`\`\`text
${data.inputData}
\`\`\`

---
`;
};
