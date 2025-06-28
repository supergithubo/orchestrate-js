// services/extractors/transcription/index.js

module.exports = (serviceKey) => {
  let service;

  try {
    service = require(`./${serviceKey}.service.js`);

    if (typeof service.transcribe !== "function") {
      throw new Error(`Module '${serviceKey}' must export 'transcribe'`);
    }
  } catch (err) {
    throw new Error(
      `Transcription Extractor "${serviceKey}" failed to load: ${err.message}`
    );
  }

  return service;
};
