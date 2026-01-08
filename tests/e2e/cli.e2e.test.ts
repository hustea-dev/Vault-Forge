import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

const runCli = (args: string, env: NodeJS.ProcessEnv = {}) => {
  const runnerPath = path.join(process.cwd(), 'dist_tests/tests/e2e/runner.js');
  const command = `node ${runnerPath} ${args}`;
  
  return execAsync(command, {
    env: {
      ...process.env,
      ...env,
      NODE_ENV: 'test',
    },
  });
};

describe('E2E Tests', () => {
  let tempVaultPath: string;

  beforeAll(async () => {
    tempVaultPath = await fs.mkdtemp(path.join(os.tmpdir(), 'vf-test-vault-'));
    
    const promptsDir = path.join(tempVaultPath, '_AI_Prompts', 'prompts', 'ja');
    await fs.mkdir(promptsDir, { recursive: true });
    
    await fs.writeFile(path.join(promptsDir, 'general.md'), `---
description: General analysis
model: gpt-5.2
aiProvider: openai
tags: []
---
You are a helpful assistant.
`);

    const modelsDir = path.join(tempVaultPath, '_AI_Prompts');
    await fs.writeFile(path.join(modelsDir, 'ai-models.json'), JSON.stringify({
        openai: ['gpt-5.2'],
        gemini: ['gemini-2.0-flash']
    }));
  });

  afterAll(async () => {
    await fs.rm(tempVaultPath, { recursive: true, force: true });
  });

  it('should run "vf ai" and produce output', async () => {
    const { stdout } = await runCli('ai "hello"', {
      OBSIDIAN_VAULT_PATH: tempVaultPath,
      APP_LANG: 'ja'
    });

    expect(stdout).toContain('This is a mock AI response.');

    const inboxPath = path.join(tempVaultPath, 'Inbox', 'general');
    const stats = await fs.stat(inboxPath);
    expect(stats.isDirectory()).toBe(true);
  }, 20000);

  it('should run "vf diary" with argument', async () => {
    const diaryContent = 'My diary entry from e2e test';
    const { stdout } = await runCli(`diary "${diaryContent}"`, {
      OBSIDIAN_VAULT_PATH: tempVaultPath,
      APP_LANG: 'ja'
    });

    const dailyPath = path.join(tempVaultPath, 'Daily');
    const stats = await fs.stat(dailyPath);
    expect(stats.isDirectory()).toBe(true);
    
    const files = await fs.readdir(dailyPath);
    expect(files.length).toBeGreaterThan(0);
    const content = await fs.readFile(path.join(dailyPath, files[0]), 'utf-8');
    expect(content).toContain(diaryContent);
  }, 20000);
});
