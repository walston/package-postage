## Description

Package.shipit helps ship utility libraries & is designed to work with [`np`](https://www.npmjs.com/package/np) as a low-level utility to copy the important parts of package.json into a sub-directory.

## Why would you do this?

This utility allows you to ship a smaller package.json to `npm` than you keep in the repository while ensuring programmatically the dependencies, version, and any other information are always up-to-date; by copying the root package.json into a sub-directory.

If you are using `np` you have the option to publish a sub-directory rather than root. But this does not include a package.json.

## How do I use this?

Copy package.json from your working-directory into `./dist`

```bash
$ postage
```

Copy package.json from your working directory into `./any-folder-name`

```bash
$ postage any-folder-name/
```

Use an arbitrary file: `./package.dist.json`

```bash
$ postage build/ --use-file package.dist.json
```

Indent with tabs

```bash
$ postage --indent tab
```

Include a few extra top-level keys

```bash
$ postage --include eslint,babel,prettier
```

Omit a few top-level keys

```bash
$ postage --omit repository,bugs,homepage
```

Include some sub-keys

```bash
$ postage \
  --omit devDependencies,optionalDependencies \
  --include devDependencies.prettier,devDependencies.eslint;
```
