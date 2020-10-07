// @ts-check

import { dice, clamp } from "./util.js";
import { build, T , B} from './MapGen.js';

/**
 * hver kartplassering er et 8bits tall 0..255
 * Bruker 3 bits til info om monster og ting, 32=ting,64=monster,128=door
 * Alle tre kan være ON samtidig - 0xE0 = 192+32 = 224  osv
 * De siste 5 bits er terreng-koder: 31 forskjellige slags terreng + 0 som betyr IMPASSABLE
 * 1 er sjø 2 er grunne, 3 er gress osv
 * Monster har en liste med terreng de kan gå på
 */


class Map {
  /** @type {Uint8ClampedArray} */
  terrain;
  /** @type {any[]} */
  islands;  // island centers

  constructor() {
    const map = new Uint8ClampedArray(80 * 80);
    const {islands,roads} = build(map,80,80);
    this.islands = islands
    this.terrain = map;
    this.roads =roads;
  }

  /**
   * Plasserer en ting (1=monster,2=item,3=door) på kartet
   * @param {number} thing  0..3
   * @param {number} x
   * @param {number} y
   */
  place(thing, x, y) {
    let t = this.terrain[y * 80 + x];
    t = (t & 31) + (thing << 6);
    this.terrain[y * 80 + x] = t;
  }

  /**
   * Fjerner monster/item/door fra kartet
   * @param {number} x
   * @param {number} y
   */
  clear(x, y) {
    let t = this.terrain[y * 80 + x];
    this.terrain[y * 80 + x] = t & 31;
  }

  /**
   * Tegner kart på skjerm med (px,py) som øvre venstre hjørne
   * divList er 11x11 div[] 
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
        divList[idx].dataset.terrain = String(t & 31);
        idx++;
      }
    }
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {number} t = terrengkode , t<32 for vanlig terreng
   *  t = 0 for utenfor brett, t>32 for her er det et monster/ting/dør
   */
  fetch(x, y) {
    if (x >= 0 && x < 80 && y >= 0 && y * 80 + x < this.terrain.length) {
      return this.terrain[y * 80 + x];
      // merk at dersom det er et monster/ting i ruta - da er t > 32
    }
    return 0;
  }

  /**
     * @param {CanvasRenderingContext2D} ctx
     */
  minimap(ctx, avatar) {
    const imgdata = ctx.createImageData(80, 80);
    let i = 0;
    this.terrain.forEach(t => {
      imgdata.data[i] = (t & 0xe0) ? 250 : 0;
      imgdata.data[i + 1] = (t === 3) ? 200 : ((t === 4) ? 100 : (t === 5) ? 150 : 0);
      imgdata.data[i + 2] = (t) === 1 ? 250 : (t === 2) ? 150 : 0;
      imgdata.data[i + 3] = 250;
      i += 4;
    })
    const { x, y } = avatar;
    let ix = clamp(x - 5, 0, 80 - 11);
    let iy = clamp(y - 5, 0, 80 - 11);
    for (let y = iy; y < iy + 12; y += 1) {
      for (let x = ix; x < ix + 12; x += 1) {
        let i = (y * 80 + x) * 4;
        imgdata.data[i] |= 0x80;
        imgdata.data[i + 1] |= 0x40;
        imgdata.data[i + 2] |= 0x40;
      }
    }
    ctx.putImageData(imgdata, 0, 0);
  }
}

export { Map };
