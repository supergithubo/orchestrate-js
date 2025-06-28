// services/llms/index.js

module.exports = (serviceKey) => {
  let service;

  try {
    service = require(`./${serviceKey}.service.js`);

    if (typeof service.getResponse !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'getResponse'`);
    }
  } catch (err) {
    throw new Error(`LLM "${serviceKey}" failed to load: ${err.message}`);
  }

  return service;
};
