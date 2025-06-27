// services/downloaders/image/index.js

module.exports = (serviceKey) => {
  let service;

  try {
    service = require(`./${serviceKey}.service.js`);

    if (typeof service.downloadImages !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'downloadImages'`);
    }
  } catch (err) {
    throw new Error(
      `Image Downloader "${serviceKey}" failed to load: ${err.message}`
    );
  }

  return service;
};
