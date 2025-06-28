// services/downloaders/video/index.js

module.exports = (serviceKey) => {
  let service;

  try {
    service = require(`./${serviceKey}.service.js`);

    if (typeof service.downloadVideos !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'downloadVideos'`);
    }
  } catch (err) {
    throw new Error(
      `Video Downloader "${serviceKey}" failed to load: ${err.message}`
    );
  }

  return service;
};
