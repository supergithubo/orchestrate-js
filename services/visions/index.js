// services/visions/index.js

module.exports = (serviceKey) => {
  let service;

  try {
    service = require(`./${serviceKey}.service.js`);

    if (typeof service.analyzeImages !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'analyzeImages'`);
    }
  } catch (err) {
    throw new Error(`Vision "${serviceKey}" failed to load: ${err.message}`);
  }

  return service;
};
