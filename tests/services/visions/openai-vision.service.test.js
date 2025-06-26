const OpenAIVisionService = require("../../../services/visions/openai-vision.service");

const mockBuffer = Buffer.from("fakeimg");
const mockBase64 = mockBuffer.toString("base64");
const mockContent = "~frame description";
const mockResponse = { choices: [{ message: { content: mockContent } }] };

jest.mock("../../../services/storage.service", () => ({
  getFileStream: jest.fn(() => {}),
  getStreamBuffer: jest.fn(() => Promise.resolve(mockBuffer)),
}));

jest.mock("openai", () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(() => Promise.resolve(mockResponse)),
        },
      },
    })),
  };
});

describe("OpenAIVisionService", () => {
  it("should analyze frames and return formatted description", async () => {
    const frames = ["frame1.jpg", "frame2.jpg"];
    const result = await OpenAIVisionService.analyzeFrames(frames);
    expect(result).toContain(mockContent);
    expect(require("openai").OpenAI).toHaveBeenCalled();
  });

  it("should batch frames if more than 5 are provided", async () => {
    const frames = Array.from({ length: 7 }, (_, i) => `frame${i + 1}.jpg`);
    const result = await OpenAIVisionService.analyzeFrames(frames);
    expect(result.split("\n\n").length).toBe(2); // 2 batches
  });

  it("should include additional context in the prompt", async () => {
    const frames = ["frame1.jpg"];
    const context = { description: "desc", hashtags: ["#a", "#b"] };
    await OpenAIVisionService.analyzeFrames(frames, context);
    expect(require("openai").OpenAI).toHaveBeenCalled();
  });
});
