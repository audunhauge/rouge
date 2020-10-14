// @ts-check

import { clamp, dice } from "./util.js";
import { Map } from "./Terrain.js";
import { B, T } from "./MapGen.js";


// default stats for alle klasser
class Stats {
  intelligence = 1.0;
  wisdom = 1.0;
  strength = 1.0;
  speed = 1.0;
  manaMax = 10;
  staminaMax = 9;
}

const Thing = {
  ITEM: 1,
  MONSTER: 2,
  DOOR: 3,
}

class Actor {
  /** @type {number} */
  x;
  /** @type {number} */
  y;
  /** @type {HTMLElement} */
  div;
  /**
   * @param {any} x
   * @param {any} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.stats = new Stats();
  }

  /**
   * Increments or set value, increment for props with max value
   * Set value if no max
   * @param {string} prop property to update
   * @param {*} delta increment or new value
   */
  regen(prop, delta) {
    if (this.stats[prop + "Max"]) {
      const max = this.stats[prop + "Max"];
      this[prop] = clamp(this[prop] + delta, 0, max);
    } else {
      this[prop] = delta;
    }
  }
  /**
   * @param {{ x: number; y: number; }} [ancor]
   */
  render(ancor) {
    // don't render if not on board
    const x = clamp(ancor.x, 0, 80 - 11);
    const y = clamp(ancor.y, 0, 80 - 11);
    if (!this.onboard({ x, y })) {
      this.div.style.opacity = "0";
      return;
    }
    this.div.style.opacity = "1";
    this.div.style.left = (this.x - x) * 32 + "px";
    this.div.style.top = (this.y - y) * 32 + "px";
  }
  /**
   * Returns true if this and point are on same board
   * @param {{x:number,y:number}} point 
   */
  onboard(point) {
    const { x, y } = this;
    return x >= point.x && x < point.x + 12 &&
      y >= point.y && y < point.y + 12
  }
}

class Monster extends Actor {
  alive = true;
  ragdoll = 20;   // et dødt monster er synlig for 20 moves
  /**
   * @param {any} x
   * @param {any} y
   */
  constructor(x, y) {
    super(x, y);
    const div = document.createElement("div");
    div.className = "monster";
    this.div = /** @type {HTMLElement} */ (div);
  }
  /**
   * @param {string} t
   */
  canWalk(t) {
    return "3456".includes(t);
  }

  decay(center) {
    this.ragdoll--;
    if (this.ragdoll < 0) return;
    if (this.ragdoll > 0) {
      this.render(center);
      this.div.style.opacity=`${this.ragdoll/20}`;
    } else {
      // unlink div
      const p = this.div.parentNode;
      p.removeChild(this.div);
      this.div = null;
      // will be removed from monsters next tick
    }
  }

  // return true if close to point
  /**
   * @param {{ x: number; y: number; }} p
   */
  isClose(p, dist=6) {
    const { x, y } = this;
    const delta = (p.x - x) ** 2 + (p.y - y) ** 2;
    return delta <= dist*dist;
  }

  /**
   * @param {number} dx
   * @param {number} dy
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * @param {any} avatar
   * @param {Map} map
   */
  action(avatar, map) {
    const { x, y } = this;
    const dx = dice(3) - 2;
    const dy = dice(3) - 2;
    if (dx || dy) {
      const on = String(map.fetch(x, y));
      const t = String(map.fetch(x + dx, y + dy));
      if (this.canWalk(t)) {
        map.clear(x, y);
        this.move(dx, dy);
        map.place(Thing.MONSTER, x + dx, y + dy);
      }
    }
  }
}

/**
 * Returns list of nearby monsters
 * @param { Monster[] } monsters
 * @param { {x:number,y:number} } p
 */
const nearbyMonsters = (monsters, p) => monsters.filter(e => e.isClose(p) && e.alive);
const touchingMonsters = (monsters, p) => monsters.filter(e => e.isClose(p,1.5) && e.alive);


export { Monster, Actor, Thing, Stats, nearbyMonsters, touchingMonsters};
