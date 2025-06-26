const fs = require("fs");
const path = require("path");
const storage = require("../../services/storage.service");

describe("storage.service", () => {
  const tmpDir = path.join(__dirname, "tmp-test-dir");
  const tmpFile = path.join(tmpDir, "test.txt");
  const tmpSubDir = path.join(tmpDir, "subdir");
  const tmpSubFile = path.join(tmpSubDir, "subfile.txt");

  beforeEach(() => {
    storage.ensureDirExists(tmpDir);
    if (!fs.existsSync(tmpFile)) fs.writeFileSync(tmpFile, "hello");
    storage.ensureDirExists(tmpSubDir);
    if (!fs.existsSync(tmpSubFile)) fs.writeFileSync(tmpSubFile, "world");
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    if (fs.existsSync(tmpSubFile)) fs.unlinkSync(tmpSubFile);
    if (fs.existsSync(tmpSubDir)) fs.rmdirSync(tmpSubDir);
    if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
  });

  it("should ensure a directory exists", () => {
    storage.ensureDirExists(tmpDir);
    expect(fs.existsSync(tmpDir)).toBe(true);
  });

  it("should save text to a file", async () => {
    await storage.saveTextToFile("hello world", tmpFile);
    const content = fs.readFileSync(tmpFile, "utf-8");
    expect(content).toBe("hello world");
  });

  it("should clear all files and subdirectories in a directory", () => {
    storage.clearFolder(tmpDir);
    expect(fs.existsSync(tmpFile)).toBe(false);
    expect(fs.existsSync(tmpSubFile)).toBe(false);
    expect(fs.existsSync(tmpSubDir)).toBe(false);
  });

  it("should clear a directory with only files", () => {
    if (fs.existsSync(tmpSubFile)) fs.unlinkSync(tmpSubFile);
    if (fs.existsSync(tmpSubDir)) fs.rmdirSync(tmpSubDir);
    storage.clearFolder(tmpDir);
    expect(fs.existsSync(tmpFile)).toBe(false);
  });

  it("should clear a directory with only subdirectories", () => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    storage.clearFolder(tmpDir);
    expect(fs.existsSync(tmpSubFile)).toBe(false);
    expect(fs.existsSync(tmpSubDir)).toBe(false);
  });

  it("should not throw if directory does not exist", () => {
    expect(() => storage.clearFolder("not-a-real-dir")).not.toThrow();
  });
});

describe("storage.service streams", () => {
  const tmpDir = path.join(__dirname, "tmp-stream-test");
  const tmpFile = path.join(tmpDir, "stream.txt");

  beforeAll(() => {
    storage.ensureDirExists(tmpDir);
  });

  afterAll(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
  });

  it("should save a stream to a file", async () => {
    const readable = fs.createReadStream(__filename);
    await storage.saveStreamToFile(readable, tmpFile);
    expect(fs.existsSync(tmpFile)).toBe(true);
  });

  it("should get a file stream", () => {
    fs.writeFileSync(tmpFile, "stream test");
    const stream = storage.getFileStream(tmpFile);
    expect(stream.readable).toBe(true);
    stream.destroy();
  });

  it("should get a buffer from a stream", async () => {
    fs.writeFileSync(tmpFile, "buffer test");
    const stream = storage.getFileStream(tmpFile);
    const buffer = await storage.getStreamBuffer(stream);
    expect(buffer.toString()).toBe("buffer test");
  });
});
