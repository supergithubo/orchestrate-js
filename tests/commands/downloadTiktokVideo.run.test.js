const path = require("path");
const fs = require("fs");

jest.mock("../../services/logger.service", () => ({ log: jest.fn() }));
jest.mock("../../services/storage.service", () => ({
  ensureDirExists: jest.fn(),
  clearFolder: jest.fn(),
  saveStreamToFile: jest.fn().mockResolvedValue("/tmp/fakefile.mp4"),
}));
jest.mock("../../services/downloaders", () => ({
  name: "mock-downloader",
  downloadVideo: jest.fn().mockResolvedValue({
    stream: {},
    metadata: {
      url: "mock",
      description: "desc",
      cover: "cover",
      hashtags: ["tag"],
    },
  }),
}));

describe("downloadTiktokVideo command", () => {
  afterAll(() => {
    jest.resetModules();
  });

  it("should call downloader and storage services and return filePath and metadata", async () => {
    const downloadTiktokVideo = require("../../commands/downloadTiktokVideo.run.js");
    const params = {
      videoUrl: "https://tiktok.com/fake",
      outputFile: { prefix: "test", ext: "mp4", folder: "tmp" },
    };
    const result = await downloadTiktokVideo(params);
    expect(result).toHaveProperty("filePath");
    expect(result).toHaveProperty("metadata");
    expect(result.metadata).toHaveProperty("url");
  });
});
