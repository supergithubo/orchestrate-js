// services/downloaders/rapidapi-tiktok.service.js

const axios = require("axios");
const config = require("../../config");
const CONFIG = config.rapidapi.tiktok;

async function downloadVideo(videoUrl) {
  const { data } = await axios.get(CONFIG.url, {
    params: { videoUrl },
    headers: {
      "x-rapidapi-key": CONFIG.apiKey,
      "x-rapidapi-host": CONFIG.host,
    },
  });

  const response = await axios.get(data.downloadUrl, {
    responseType: "stream",
  });

  return {
    stream: response.data,
    metadata: {
      url: data.downloadUrl,
      description: data.description,
      cover: data.cover,
      hashtags: data.hashtags.map((hashtag) => hashtag.hashtagName),
    },
  };
}

module.exports = {
  downloadVideo,
  name: "rapidai-tiktok",
};
