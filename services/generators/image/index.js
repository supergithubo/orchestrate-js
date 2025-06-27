// services/generators/image/index.js

module.exports = (serviceKey) => {
  let service;

  try {
    service = require(`./${serviceKey}.service.js`);

    if (typeof service.getImageResponse !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'getImageResponse'`);
    }
  } catch (err) {
    throw new Error(
      `Image Generator "${serviceKey}" failed to load: ${err.message}`
    );
  }

  return service;
};
