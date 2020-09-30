// @ts-check
 
import { dice, clamp } from "./util.js";

class Map {
  terrain;

  constructor() {
    const map = new Uint8ClampedArray(80 * 80);
    // legger inn litt tilfeldig terreng
    // 0=gress, 1=skog, 2=daler, 3=fjell
    for (let y = 0; y < 80; y += 1) {
      for (let x = 0; x < 80; x += 1) {
        map[y * 80 + x] = dice(4) - 1;
      }
    }
    this.terrain = map;
  }

  /**
   * Tegner kart på skjerm med (px,py) som øvre venstre hjørne
   * divList er 11x11 div[] - funnet med querySelectorAll("#board > div")
   * @param {number} px
   * @param {number} py
   * @param {HTMLElement[]} divList
   */
  render(px, py, divList) {
    // sjekk at plass til å hente 11x11 ruter
    let ix = clamp(px, 0, 80 - 11);
    let iy = clamp(py, 0, 80 - 11);
    let idx = 0;
    for (let y = iy; y < iy + 12; y += 1) {
      for (let x = ix; x < ix + 12; x += 1) {
        const t = this.terrain[y * 80 + x];
        divList[idx].dataset.terrain = String(t);
        idx++;
      }
    }
  }
}

export { Map };
