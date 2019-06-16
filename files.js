const path = require("path");
const fs = require("fs");

const KEYS_TO_VALIDATE = ["bin", "main", "module"];
const COPY_FILES = /^(?:CHANGELOG|changelog|README|readme|LICEN[SC]E|licen[sc]e)(?:\..*)?$/;
const CWD = process.cwd();
let destination = path.resolve(CWD, "dist");

function getFilepath(p) {
  if (!path.isAbsolute(p)) {
    p = path.resolve(CWD, p);
  }

  return new Promise((resolve, reject) => {
    fs.stat(p, (err, stats) => {
      if (err) return reject(err);
      if (stats.isFile()) return resolve(path.relative(CWD, p));
      reject(Error(`UnknownError: "${path.relative(CWD, p)}" is not a file.`));
    });
  });
}

/** @param {string} p path to package.json */
function readPackage(p) {
  if (!path.isAbsolute(p)) p = path.resolve(CWD, p);
  return new Promise((resolve, reject) => {
    if (!fs.statSync(p).isFile()) {
      return reject(
        Error(`UnknownError: "${path.relative(CWD, p)}" is not a file`)
      );
    }

    fs.readFile(p, (err, buff) => {
      if (err) return reject(err);
      resolve(buff.toString());
    });
  });
}

function writePackage(data) {
  const filename = path.resolve(destination, "package.json");
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, err => {
      if (err) return reject(err);
      resolve();
    });
  }).then(() => validateFilePointers(data));
}

function validateFilePointers(data) {
  const pkg = JSON.parse(data);

  const exists = rel =>
    new Promise((resolve, reject) => {
      fs.stat(path.resolve(destination, rel), (err, stats) => {
        if (err) return reject(err);
        if (stats.isFile()) return resolve("OK");
        return reject("ERR");
      });
    });

  return Promise.all([
    typeof pkg["main"] == "string"
      ? exists(pkg["main"])
      : Promise.resolve('No "main" key'),
    typeof pkg["module"] == "string"
      ? exists(pkg["module"])
      : Promise.resolve('No "module" key'),
    typeof pkg["bin"] == "object"
      ? Promise.all(
          Object.values(pkg["bin"]).map(file_path => exists(file_path))
        )
      : Promise.resolve('No "bin" key')
  ]);
}

/** @param {string} src path to CHANGELOG.md, README.md, LICENSE */
function copyFilesFrom(src) {
  return new Promise((resolve, reject) => {
    src = path.isAbsolute(src) ? src : path.resolve(CWD, src);
    const directory = fs.statSync(src).isDirectory() ? src : path.dirname(src);
    const src_files = fs
      .readdirSync(directory)
      .filter(value => COPY_FILES.test(value));

    return Promise.all(
      src_files.map(
        src_file =>
          new Promise((resolve, reject) => {
            const filename = path.basename(src_file);
            fs.copyFile(src_file, path.resolve(destination, filename), err => {
              if (err) return reject(err);
              resolve();
            });
          })
      )
    ).then(resolve, reject);
  });
}

module.exports = directoryOfBuild => {
  if (!path.isAbsolute(directoryOfBuild)) {
    directoryOfBuild = path.resolve(CWD, directoryOfBuild);
  }

  const stats = fs.statSync(directoryOfBuild);
  if (stats.isDirectory()) {
    destination = directoryOfBuild;
  } else {
    throw Error(
      `TargetDirectoryError: "${directoryOfBuild}" is not a directory`
    );
  }

  return {
    getFilepath,
    readPackage,
    writePackage,
    copyFilesFrom
  };
};
