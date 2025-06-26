const mockBuffer = Buffer.from("fakeimg");
const mockBase64 = mockBuffer.toString("base64");
const mockPrediction = { output: "desc" };
const mockAxios = {
  post: jest.fn(() => Promise.resolve({ data: mockPrediction })),
};

jest.mock("axios", () => mockAxios);
jest.mock("../../../services/storage.service", () => ({
  getFileStream: jest.fn(() => {}),
  getStreamBuffer: jest.fn(() => Promise.resolve(mockBuffer)),
}));

const ReplicateBlipService = require("../../../services/visions/replicate-blip.service");

describe("ReplicateBlipService", () => {
  beforeEach(() => {
    mockAxios.post.mockClear();
  });

  it("should analyze frames and return descriptions", async () => {
    const frames = ["frame1.jpg", "frame2.jpg"];
    const result = await ReplicateBlipService.analyzeFrames(frames);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("frame", "frame1.jpg");
    expect(result[0]).toHaveProperty("description", "desc");
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("should handle missing output in prediction", async () => {
    mockAxios.post.mockImplementationOnce(() => Promise.resolve({ data: {} }));
    const frames = ["frame1.jpg"];
    const result = await ReplicateBlipService.analyzeFrames(frames);
    expect(result[0].description).toBe("No output");
  });
});
