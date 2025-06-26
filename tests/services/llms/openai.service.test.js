const mockContent = "hello world";
const mockResponse = { choices: [{ message: { content: mockContent } }] };

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

describe("OpenAIService", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("should get chat response from OpenAI", async () => {
    const service = require("../../../services/llms/openai.service");
    const messages = [{ role: "user", content: "hi" }];
    const result = await service.getChatResponse(messages);
    expect(result).toBe(mockContent);
    expect(require("openai").OpenAI).toHaveBeenCalled();
  });

  it("should throw if OpenAI call fails", async () => {
    jest.resetModules();
    require("openai").OpenAI.mockImplementationOnce(() => ({
      chat: {
        completions: {
          create: jest.fn(() => Promise.reject(new Error("fail"))),
        },
      },
    }));
    const service = require("../../../services/llms/openai.service");
    await expect(
      service.getChatResponse([{ role: "user", content: "fail" }])
    ).rejects.toThrow("fail");
  });
});
