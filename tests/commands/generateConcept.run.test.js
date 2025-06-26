jest.mock("../../services/logger.service", () => ({ log: jest.fn() }));
jest.mock("../../services/llms", () => ({
  name: "mock-llm",
  getChatResponse: jest.fn().mockResolvedValue(["concept1", "concept2"]),
}));

describe("generateConcept command", () => {
  afterAll(() => {
    jest.resetModules();
  });

  it("should call llm service and return concepts", async () => {
    const generateConcept = require("../../commands/generateConcept.run.js");
    const params = {
      transcript: "text",
      metadata: { description: "desc", hashtags: ["tag"] },
      frameDescriptions: ["desc1", "desc2"],
    };
    const result = await generateConcept(params);
    expect(result).toHaveProperty("concepts");
    expect(Array.isArray(result.concepts)).toBe(true);
  });
}); 