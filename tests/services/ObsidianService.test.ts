import { jest } from '@jest/globals';
import * as path from 'path';

// 1. モックを定義する
jest.unstable_mockModule('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
  appendFile: jest.fn(),
  unlink: jest.fn(),
}));

// 2. モックされたモジュールをインポートする
const { mkdir, writeFile, readFile, appendFile, unlink } = await import('fs/promises');
const mockedFs = { mkdir, writeFile, readFile, appendFile, unlink };

// 3. テスト対象のモジュールを動的にインポートする
const { ObsidianService } = await import('../../src/services/ObsidianService');

describe('ObsidianService', () => {
  const vaultPath = '/fake/vault';
  let obsidianService: InstanceType<typeof ObsidianService>;

  beforeEach(() => {
    jest.clearAllMocks();
    obsidianService = new ObsidianService(vaultPath);
  });

  describe('createNote', () => {
    it('should create directory and write file with correct content', async () => {
      const relativePath = 'test/note.md';
      const content = 'Hello, world!';
      const fullPath = path.join(vaultPath, relativePath);
      const dirPath = path.dirname(fullPath);

      await obsidianService.createNote(relativePath, content);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(dirPath, { recursive: true });
      expect(mockedFs.writeFile).toHaveBeenCalledWith(fullPath, content, 'utf-8');
    });
  });

  describe('readNote', () => {
    it('should read file and return its content', async () => {
      const relativePath = 'test/note.md';
      const content = 'file content';
      const fullPath = path.join(vaultPath, relativePath);
      
      (mockedFs.readFile as jest.Mock).mockResolvedValue(content);

      const result = await obsidianService.readNote(relativePath);

      expect(mockedFs.readFile).toHaveBeenCalledWith(fullPath, 'utf-8');
      expect(result).toBe(content);
    });
  });

  describe('appendNote', () => {
    it('should append content to a file', async () => {
      const relativePath = 'test/note.md';
      const content = 'appended content';
      const fullPath = path.join(vaultPath, relativePath);

      await obsidianService.appendNote(relativePath, content);

      expect(mockedFs.appendFile).toHaveBeenCalledWith(fullPath, content, 'utf-8');
    });
  });

  describe('deleteNote', () => {
    it('should delete a file', async () => {
      const relativePath = 'test/note.md';
      const fullPath = path.join(vaultPath, relativePath);

      await obsidianService.deleteNote(relativePath);

      expect(mockedFs.unlink).toHaveBeenCalledWith(fullPath);
    });
  });

  describe('appendToDailyNote', () => {
    it('should create a new daily note if it does not exist', async () => {
      const content = 'My first diary entry';
      const tags = ['diary', 'test'];
      
      // ファイルが存在しない場合のエラーをシミュレート
      (mockedFs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      await obsidianService.appendToDailyNote(content, tags);

      // writeFileが呼ばれたことを確認（新規作成）
      expect(mockedFs.writeFile).toHaveBeenCalled();
      // appendFileは呼ばれない
      expect(mockedFs.appendFile).not.toHaveBeenCalled();
    });

    it('should append to an existing daily note', async () => {
        const content = 'Another entry';
        const tags = ['update'];
        const existingContent = '---\ntags: [initial]\n---\n\n- **10:00** First entry';
        
        (mockedFs.readFile as jest.Mock).mockResolvedValue(existingContent);
  
        await obsidianService.appendToDailyNote(content, tags);
  
        // writeFileが呼ばれたことを確認（追記もwriteFileで行われる）
        expect(mockedFs.writeFile).toHaveBeenCalled();
        // 最終的な内容に新しいエントリとタグが含まれているかチェック
        const writtenContent = (mockedFs.writeFile as jest.Mock).mock.calls[0][1];
        expect(writtenContent).toContain('Another entry');
        expect(writtenContent).toContain('initial');
        expect(writtenContent).toContain('update');
    });
  });
});
