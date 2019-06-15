const path = require("path");
const fs = require("fs");

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
  });
}

function copyFile(src) {
  const filename = path.basename(src);
  return new Promise((resolve, reject) => {
    fs.copyFile(src, path.resolve(destination, filename), err => {
      if (err) return reject(err);
      resolve();
    });
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
    copyFile
  };
};
