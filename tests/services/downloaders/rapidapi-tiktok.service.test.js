const mockStream = {};
const mockData = {
  downloadUrl: "http://video.url",
  description: "desc",
  cover: "cover.jpg",
  hashtags: [{ hashtagName: "#a" }, { hashtagName: "#b" }],
};

jest.mock("axios", () => ({
  get: jest
    .fn()
    .mockImplementationOnce(() => Promise.resolve({ data: mockData }))
    .mockImplementationOnce(() => Promise.resolve({ data: mockStream })),
}));

describe("RapidApiTiktokService", () => {
  beforeEach(() => {
    jest.resetModules();
    const mockAxios = require("axios");
    mockAxios.get.mockClear();
    mockAxios.get
      .mockImplementationOnce(() => Promise.resolve({ data: mockData }))
      .mockImplementationOnce(() => Promise.resolve({ data: mockStream }));
  });

  it("should download video and return stream and metadata", async () => {
    const service = require("../../../services/downloaders/rapidapi-tiktok.service");
    const result = await service.downloadVideo("http://tiktok.com/v");
    expect(result.stream).toBe(mockStream);
    expect(result.metadata).toEqual({
      url: mockData.downloadUrl,
      description: mockData.description,
      cover: mockData.cover,
      hashtags: ["#a", "#b"],
    });
    const mockAxios = require("axios");
    expect(mockAxios.get).toHaveBeenCalledTimes(2);
  });

});
