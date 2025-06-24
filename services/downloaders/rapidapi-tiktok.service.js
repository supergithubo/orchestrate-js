// services/downloaders/rapidapi-tiktok.service.js

const axios = require("axios");

const config = require("../../config");

const APIKEY = config.rapidapi.tiktok.apiKey;
const HOST = config.rapidapi.tiktok.host;
const URL = config.rapidapi.tiktok.url;

async function downloadVideo(videoUrl) {
  const { data } = await axios.get(URL, {
    params: { videoUrl },
    headers: {
      "x-rapidapi-key": APIKEY,
      "x-rapidapi-host": HOST,
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
