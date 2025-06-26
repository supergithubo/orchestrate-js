const path = require("path");
const mockFrames = ["frame_001.jpg", "frame_002.jpg"];

jest.mock("child_process", () => ({
  exec: jest.fn((cmd, cb) => cb(null, "", "")),
  execSync: jest.fn(() => "10.0"),
}));
jest.mock("fs", () => ({
  readdirSync: jest.fn(() => mockFrames),
  existsSync: jest.fn(() => true),
  statSync: jest.fn(() => ({ isDirectory: () => false })),
  createReadStream: jest.fn(),
  createWriteStream: jest.fn(() => ({
    on: jest.fn((event, cb) => {
      if (event === "finish") setTimeout(cb, 0);
      return this;
    }),
    pipe: jest.fn(),
  })),
  unlinkSync: jest.fn(),
  rmSync: jest.fn(),
}));

const service = require("../../../services/extractors/ffmpeg-frame.service");

describe("FFmpegFrameService", () => {
  it("should extract frames and return file paths", async () => {
    const frames = await service.extractFrames("video.mp4", 2);
    expect(Array.isArray(frames)).toBe(true);
    expect(frames.length).toBe(mockFrames.length);
  });

  it("should throw if getVideoDuration fails", async () => {
    require("child_process").execSync.mockImplementationOnce(() => {
      throw new Error("fail");
    });
    await expect(service.extractFrames("bad.mp4", 2)).rejects.toThrow(
      "Failed to get video duration"
    );
  });
});
