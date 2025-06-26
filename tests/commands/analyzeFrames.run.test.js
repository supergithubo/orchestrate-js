jest.mock("../../services/logger.service", () => ({ log: jest.fn() }));
jest.mock("../../services/storage.service", () => ({
  saveTextToFile: jest.fn().mockResolvedValue(),
}));
jest.mock("../../services/visions", () => ({
  name: "mock-vision",
  analyzeFrames: jest.fn().mockResolvedValue(["desc1", "desc2"]),
}));

describe("analyzeFrames command", () => {
  afterAll(() => {
    jest.resetModules();
  });

  it("should call vision service and return frameDescriptions", async () => {
    const analyzeFrames = require("../../commands/analyzeFrames.run.js");
    const params = { frames: ["frame1.jpg"], metadata: {}, opts: {} };
    const result = await analyzeFrames(params);
    expect(result).toHaveProperty("frameDescriptions");
    expect(Array.isArray(result.frameDescriptions)).toBe(true);
  });

  it("should save analysis to file if opts.saveFile is provided", async () => {
    const analyzeFrames = require("../../commands/analyzeFrames.run.js");
    const params = {
      frames: ["frame1.jpg"],
      metadata: {},
      opts: { saveFile: "out.txt" },
    };
    const result = await analyzeFrames(params);
    expect(result).toHaveProperty("frameDescriptions");
  });
});
