// @ts-check
 
/**
 * Terningfunksjon
 * @param {number} n
 * @returns {number} 1..n 
 */
function dice(n) {
  return Math.trunc(Math.random() * n) + 1;
}

/**
 * Klemmer x mellom lo og hi
 * @param {number} x
 * @param {number} lo
 * @param {number} hi
 * @returns {number} lo <= return <= hi
 */
function clamp(x, lo, hi) {
  if (x > hi) return hi;
  if (x < lo) return lo;
  return x;
}

export { dice, clamp };
