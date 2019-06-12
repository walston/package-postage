const path = require("path");
const fs = require("fs");
const yargs = require("yargs");
const objectPath = require("object-path");

const args = yargs
  .scriptName("package-shipit")
  .version()
  .option("no-overwrite", {
    boolean: true,
    describe: "Terminates process rather than overwriting old target path",
    default: false
  })
  .option("use-file", {
    describe: "Use provided file as `package.json`",
    default: path.join(process.cwd(), "package.json")
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
  if (!fs.existsSync(uri)) {
    const rel = path.relative(process.cwd(), uri);
    console.error(`Cannot use "${uri}", file does not exist`);
    process.exit(1);
  }
  if (uri[0] === "/") return uri;
  return path.join(process.cwd(), uri);
})(args["use-file"]);

const path_to_output = (function(uri) {
  /** @todo check to ensure `uri` is a directory */
  if (!fs.existsSync(uri)) {
    const rel = path.relative(process.cwd(), uri);
    console.error(`Cannot write to "${rel}", directory does not exist`);
    process.exit(1);
  }
  uri = path.join(uri, "package.json");
  if (uri[0] === "/") return uri;
  return path.join(process.cwd(), uri);
})(args._[0] || path.join(process.cwd(), "dist"));

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
  "module",
  "scripts",
  "dependencies",
  "peerDependencies",
  "license"
];

for (const key of default_keys) {
  if (objectPath(pkg).has(key)) {
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
