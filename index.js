const path = require("path");
const fs = require("fs");
const yargs = require("yargs");
const objectPath = require("object-path");

const args = yargs
  .option("no-overwrite", {
    boolean: true,
    describe: "Terminates process rather than overwriting old target path",
    default: false
  })
  .option("omit", {
    string: true,
    alias: "o",
    describe:
      "Omit certain keys/sub-keys from being included in the output package.json",
    example: "--omit=scripts,contributors",
    default: ""
  })
  .option("include", {
    string: true,
    alias: "i",
    describe: "Include keys/sub-keys in the output package.json",
    example: "--include=eslint,scripts.start,scripts.test",
    default: ""
  })
  .option("indent", {
    string: true,
    alias: "n",
    default: "tab",
    choices: ["2", "4", "tab"]
  }).argv;

const indent = (function(arg) {
  if (arg === "tab") return "\t";
  if (arg === "4") return "    ";
  return "  ";
})(args.indent);

const path_to_original = (function(uri) {
  // if uri is an absolute path, just use that, otherwise append process.cwd
  if (uri[0] === "/") return uri;
  return path.join(process.cwd(), uri);
})(
  /** @note allow 0 args or even 1 arg that is the target directory */
  args._[1] ? args._[0] || "package.json" : "package.json"
);

const path_to_output = (function(uri) {
  if (!/\/package\.json$/.test(uri)) uri += "package.json";
  if (uri[0] === "/") return uri;
  return path.join(process.cwd(), uri);
})(args._[1] || "dist/package.json");

if (!fs.existsSync(path_to_original)) {
  console.error("Package does not exist", args.package);
  process.exit(1);
}

if (!fs.existsSync(path.dirname(path_to_output))) {
  console.error(
    "Output directory does not exist",
    path.dirname(path_to_output)
  );
  process.exit(1);
}

let pkg;
try {
  pkg = require(path_to_original);
} catch (error) {
  console.error("Package isn't not valid");
  console.error(error);
  process.exit(1);
}

let new_pkg = {};
const default_keys = [
  "author",
  "contributors",
  "description",
  "keywords",
  "repository",
  "bugs",
  "main",
  "scripts",
  "dependencies",
  "license"
];

for (const key of default_keys) {
  if (Object.prototype.hasOwnProperty.bind(pkg)(key)) {
    new_pkg[key] = pkg[key];
  }
}

/** @type {{ key: string, action: 'include' | 'omit' }[]} */
const user_requested_keys = []
  .concat(
    args.include.split(",").map(key => ({ key, action: "include" })),
    args.omit.split(",").map(key => ({ key, action: "omit" }))
  )
  .sort(require("./path-sort"));

for (const { key, action } of user_requested_keys) {
  if (action === "include" && objectPath(pkg).has(key)) {
    objectPath(new_pkg).set(key, objectPath(pkg).get(key));
  } else if (action === "omit") {
    objectPath(new_pkg).del(key);
  }
}

new_pkg = Object.assign(
  {
    name: pkg.name,
    version: pkg.version
  },
  new_pkg
);

const pkg_data = JSON.stringify(new_pkg, null, indent);

fs.writeFile(path_to_output, pkg_data, err => {
  if (!err) return;
  console.error(err);
  process.exit(1);
});
