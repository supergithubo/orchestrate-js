// services/extractors/frame/index.js

module.exports = (serviceKey) => {
  let service;

  try {
    service = require(`./${serviceKey}.service.js`);

    if (typeof service.extractFrames !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'extractFrames'`);
    }
  } catch (err) {
    throw new Error(
      `Frame Extractor "${serviceKey}" failed to load: ${err.message}`
    );
  }

  return service;
};
