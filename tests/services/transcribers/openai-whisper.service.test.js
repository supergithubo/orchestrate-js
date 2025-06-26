const mockStream = {};
const mockText = "transcribed text";
const mockResponse = { text: mockText, duration: 12.34, segments: [1, 2, 3] };

jest.mock("../../../services/storage.service", () => ({
  getFileStream: jest.fn(() => mockStream),
}));

jest.mock("openai", () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      audio: {
        transcriptions: {
          create: jest.fn(() => Promise.resolve(mockResponse)),
        },
      },
    })),
  };
});

describe("OpenAIWhisperService", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("should transcribe audio and return text and metadata", async () => {
    const service = require("../../../services/transcribers/openai-whisper.service");
    const result = await service.getAudioTranscription("fakepath.wav");
    expect(result.text).toBe(mockText);
    expect(result.metadata).toEqual({
      textLength: mockText.length,
      duration: mockResponse.duration.toFixed(2),
      segmentCount: mockResponse.segments.length,
    });
  });

  it("should handle missing duration and segments gracefully", async () => {
    jest.resetModules();
    require("openai").OpenAI.mockImplementationOnce(() => ({
      audio: {
        transcriptions: {
          create: jest.fn(() => Promise.resolve({ text: "abc" })),
        },
      },
    }));
    const service = require("../../../services/transcribers/openai-whisper.service");
    const result = await service.getAudioTranscription("fakepath.wav");
    expect(result.metadata).toEqual({
      textLength: 3,
      duration: "n/a",
      segmentCount: "n/a",
    });
  });
});
