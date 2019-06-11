/**
 * @typedef UserKey
 * @property {string} key
 * @property {'include'|'omit'} action
 */

/**
 * @param {UserKey} a_path
 * @param {UserKey} b_path
 * @returns {1|-1} */
function pathSort(a_path, b_path) {
  const a = a_path.key.split(".");
  const b = b_path.key.split(".");
  var l = Math.max(a.length, b.length);
  /** return -1 ? move a up : move b up */
  for (var i = 0; i < l; i++) {
    if (i >= a.length) return -1;
    if (i >= b.length) return +1;
    if (a[i] > b[i]) return +1;
    if (a[i] < b[i]) return -1;
    if (a[i].length < b[i].length) return -1;
    if (a[i].length > b[i].length) return +1;
    if (a_path.action === "include" && b_path.action === "omit") return +1;
    if (b_path.action === "include" && a_path.action === "omit") return -1;
  }
  return -1;
}
module.exports = pathSort;
