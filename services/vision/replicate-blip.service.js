// services/vision/replicate-blip.service.js

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const config = require("../../config");

const storageService = require("../storage.service");

const APITOKEN = config.replicate.apiToken;
const URL = config.replicate.url;
const VERSION = config.replicate.blip.modelVersion;

async function analyzeFrames(frames = []) {
  const results = [];

  for (const framePath of frames) {
    const stream = storageService.getFileStream(framePath);
    const buffer = await storageService.getStreamBuffer(stream);
    const base64Image = buffer.toString("base64");

    const response = await axios.post(
      URL,
      {
        version: VERSION,
        input: {
          image: `data:image/jpeg;base64,${base64Image}`,
        },
      },
      {
        headers: {
          Authorization: `Token ${APITOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const prediction = response.data;
    if (prediction?.output) {
      results.push({ frame: framePath, description: prediction.output });
    } else {
      results.push({ frame: framePath, description: "No output" });
    }
  }

  return results;
}

module.exports = {
  analyzeFrames,
  name: "replicate-blip",
};
