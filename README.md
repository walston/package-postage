![Package Postage Logo](./package-postage.png)

## Description

**Package Postage** helps ship _utility libraries_. It is designed to work with [`np`](https://www.npmjs.com/package/np) as a low-level utility to copy the important parts of package.json into a sub-directory for publishing. I personally hook into `npm postversion`

## Why would you do this?

 - 🗜Ship smaller packages: only publish the transpiled code.
 - 💁‍‍Pretty pathing: `import "your-package/utils"` works. No more `your-package/src/utils`
 - 👯‍Avoid managing 2 package.json: encode your deployment stream.

`npm publish` will allow you to publish a sub-directory, but does not copy package-json into that sub-directory. It is reasonable to want to publish that sub-directory but to ensure consistency of a `./dist/package.json` with `./package.json` would require some level of scripting. Enter **Package Postage**

## Installation

```
$ npm install --save-dev package-postage
```

## ⚙️ API

- **`indent`**: `["tab", "4", "2"]` - Specify the indentation of the resultant _package.json_
- **`use-file`**: Use an arbitrary file as _package.json_
- **`omit`**: Some tags are included by default, you may want to manually exclude them: _"author", "bin", "bugs", "contributors", "dependencies", "description", "keywords", "license", "main", "module", "peerDependencies", "repository"._
- **`include`**: If you'd like to ensure some non-standard keys are shipped pass the key to this.

**note** `omit` & `include` can be combined to only include some child keys while stripping the rest: _e.g._

```json
{
  "postage": {
    "omit": ["peerDependencies"],
    "include": ["peerDependencies.react"]
  }
}
```

## 📦 Configure in package.json

```json
{
  "name": "my-awesome-package",
  "version": "0.1.1",
  "postage": {
    "omit": ["omit", "any", "top-level", "keys", "included", "by", "default"],
    "include": ["include", "any.top-level.or.sub.keys"],
    "indent": "tab"
  }
}
```

## 👾 Call from Gulp

```js
const postage = require("package-postage");
// ...
postage("path_to_dest", {
  omit: ["peerDependencies"],
  include: ["peerDependencies.react"],
  indent: "tab"
});
```

## 💻 Execute from terminal

```bash
# Copy package.json from your working-directory into `./dist`
$ postage

# Copy package.json from your working directory into `./any-folder-name`
$ postage any-folder-name/

# Use an arbitrary file: `./package.dist.json`
$ postage build/ --use-file package.dist.json

# Indent with tabs
$ postage --indent tab

# Include a few extra top-level keys
$ postage --include eslint,babel,prettier

# Omit a few top-level keys
$ postage --omit repository,bugs,homepage

# Include some sub-keys
$ postage \
  --omit devDependencies,optionalDependencies \
  --include devDependencies.prettier,devDependencies.eslint;
```
