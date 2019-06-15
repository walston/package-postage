const objectPath = require("object-path");

const DEFAULT_KEYS = [
  "author",
  "contributors",
  "description",
  "keywords",
  "repository",
  "bugs",
  "main",
  "module",
  "dependencies",
  "peerDependencies",
  "license"
];

/**
 * @typedef Options
 * @property {string[]} omit
 * @property {string[]} include
 * @property {string} indent
 */

/**
 * makePackage
 * @param {string} config_data
 * @param {Options} options
 * @returns {string}
 */
function makePackage(config_data, options) {
  options = {
    omit: options.omit || [],
    include: options.include || [],
    indent: options.indent || "  "
  };

  let config;
  try {
    config = JSON.parse(config_data);
  } catch (error) {
    throw Error("ParseError: 'package.json' is not valid");
  }

  const new_config = {};

  const keys = [
    ...DEFAULT_KEYS.map(inclusion),
    ...options.include.map(inclusion),
    ...options.omit.map(omission)
  ].sort(require("./path-sort"));

  for (const { key, action } of keys) {
    if (action === "include" && objectPath(config).has(key)) {
      objectPath(new_config).set(key, objectPath(config).get(key));
    } else if (action === "omit") {
      objectPath(new_config).del(key);
    }
  }

  const required_keys = ["name", "version"];
  const required_config = {};
  for (const key of required_keys) {
    if (objectPath(config).has(key)) {
      objectPath(required_config).set(key, objectPath(config).get(key));
    } else {
      throw Error(`Missing required key ${key}`);
    }
  }

  return JSON.stringify(
    Object.assign(required_config, new_config),
    null,
    options.indent
  );
}

/**
 * @param {string} key
 * @returns {{ key: string, action: 'omit' }} */
function omission(key) {
  return { key, action: "omit" };
}

/**
 * @param {string} key
 * @returns {{ key: string, action: 'include' }} */
function inclusion(key) {
  return { key, action: "include" };
}

module.exports = makePackage;
