const path = require("path");
const main = require("./main");
const files = require("./files");
/**
 * @typedef Options
 * @property {string[]} [omit] package.json keys (dot-syntax works)
 * @property {string[]} [include] package.json keys (dot-syntax works)
 * @property {string} [useFile] use this file as `package.json`
 * @property {string} [target] directory to write files
 * @property {'tab'|'2'|'4'} [indent] */

/** @param {Options} [options] */
module.exports = function(options) {
  if (!options) options = {};

  const target = resolve(options.target || "./dist");
  const package_json = options.useFile || resolve("./package.json");
  const fileWriter = files(target);

  fileWriter
    .readPackage(package_json)
    .then(package_json => {
      return main(package_json, {
        omit: options.omit || [],
        include: options.include || [],
        indent: indentation(options.indent || "2")
      });
    })
    .then(package_json => {
      return fileWriter.writePackage(package_json);
    })
    .then(() => {
      fileWriter.copyFilesFrom(process.cwd());
    });
};

function resolve(p) {
  return path.resolve(process.cwd(), p);
}

function indentation(indent) {
  if (indent === "tab") return "\t";
  if (indent === "4") return "    ";
  return "  ";
}
