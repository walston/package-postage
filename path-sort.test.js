const pathSort = require("./path-sort");

function testSet(omissions, inclusions) {
  return []
    .concat(
      omissions.map(key => ({ key, action: "omit" })),
      inclusions.map(key => ({ key, action: "include" }))
    )
    .sort(pathSort);
}

function compareSet(actual, expected) {
  const errors = [];
  for (let i = 0; i < actual.length; i++) {
    try {
      console.assert(
        actual[i].key === expected[i].key,
        "Incorrect key:\n" +
          `Expected: ${expected[i].key}.\nActual: ${actual[i].key}`
      );
      console.assert(
        actual[i].action === expected[i].action,
        "Incorrect action:\n" +
          `Expected: ${expected[i].action}.\nActual: ${actual[i].action}`
      );
    } catch (e) {
      errors.push(e);
    }
  }

  if (errors.length > 0) {
    errors.map(console.error);
    process.exit(1);
  }
}

const O = "omit";
const I = "include";
compareSet(testSet(["repository", "dependencies"], ["dependencies.color"]), [
  { key: "dependencies", action: O },
  { key: "dependencies.color", action: I },
  { key: "repository", action: O }
]);
