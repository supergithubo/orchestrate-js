// services/utils.service.js

/**
 * Returns a shallow copy of the object with all undefined values removed.
 * @param {object} obj
 * @returns {object}
 */
function filterUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

module.exports = { filterUndefined };
