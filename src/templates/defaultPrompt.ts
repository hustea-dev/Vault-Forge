import { TEXT } from '../config/text.js';

export const DEFAULT_PROMPTS: Record<string, string> = {
    general: `---
description: "${TEXT.loader.defaultPromptDescription.replace('{promptName}', 'general')}"
version: 1.0
tags: ["system-prompt"]
aiProvider: ""
model: ""
---

${TEXT.prompts.general}
`,

    xpost: `---
description: "${TEXT.loader.defaultPromptDescription.replace('{promptName}', 'xpost')}"
version: 1.0
tags: ["system-prompt"]
aiProvider: ""
model: ""
---

${TEXT.prompts.xpost}
`,

    debug: `---
description: "${TEXT.loader.defaultPromptDescription.replace('{promptName}', 'debug')}"
version: 1.0
tags: ["system-prompt"]
aiProvider: ""
model: ""
---

${TEXT.prompts.debug}
`
};
