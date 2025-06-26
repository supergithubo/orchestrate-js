jest.mock("../../services/logger.service", () => ({ log: jest.fn() }));
jest.mock("../../services/storage.service", () => ({
  saveTextToFile: jest.fn().mockResolvedValue(),
}));
jest.mock("../../services/transcribers", () => ({
  name: "mock-transcriber",
  getAudioTranscription: jest.fn().mockResolvedValue({
    text: "hello world",
    metadata: { textLength: 11, duration: 1.23, segmentCount: 1 },
  }),
}));

describe("transcribeVideo command", () => {
  afterAll(() => {
    jest.resetModules();
  });

  it("should call transcriber service and return transcription", async () => {
    const transcribeVideo = require("../../commands/transcribeVideo.run.js");
    const params = { filePath: "video.mp4", opts: {} };
    const result = await transcribeVideo(params);
    expect(result).toHaveProperty("transcription");
    expect(result.transcription).toBe("hello world");
  });

  it("should save transcription to file if opts.saveFile is provided", async () => {
    const transcribeVideo = require("../../commands/transcribeVideo.run.js");
    const params = { filePath: "video.mp4", opts: { saveFile: "out.txt" } };
    const result = await transcribeVideo(params);
    expect(result).toHaveProperty("transcription");
  });
}); 