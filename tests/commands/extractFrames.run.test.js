jest.mock("../../services/logger.service", () => ({ log: jest.fn() }));
jest.mock("../../services/storage.service", () => ({
  ensureDirExists: jest.fn(),
  clearFolder: jest.fn(),
}));
jest.mock("../../services/extractors", () => ({
  name: "mock-extractor",
  outputDir: "tmp",
  extractFrames: jest.fn().mockResolvedValue(["frame1.jpg", "frame2.jpg"]),
}));

describe("extractFrames command", () => {
  afterAll(() => {
    jest.resetModules();
  });

  it("should call extractor and storage services and return frames", async () => {
    const extractFrames = require("../../commands/extractFrames.run.js");
    const params = { filePath: "video.mp4" };
    const result = await extractFrames(params);
    expect(result).toHaveProperty("frames");
    expect(Array.isArray(result.frames)).toBe(true);
    expect(result.frames.length).toBe(2);
  });
});
