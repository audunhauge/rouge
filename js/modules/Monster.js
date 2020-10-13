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
  staminaMax = 2;
}

const Thing = {
  ITEM: 1,
  MONSTER: 2,
  DOOR: 3,
}

class Actor {
  x;
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
  regen(prop,delta) {
    if (this.stats[prop+"Max"]) {
      const max = this.stats[prop+"Max"];
      this.prop = clamp(this.prop+delta,0,max);
    } else {
      this.prop = delta;
    }
  }
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
   * Returns true if this an point are on same board
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
  canWalk(t) {
    return "3456".includes(t);
  }

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
      if (this.canWalk(t) ) {
        map.clear(x, y)
        this.move(dx, dy);
        map.place(Thing.MONSTER, x + dx, y + dy);
      }
    }
  }
}

class Player extends Actor {
  turnOver = false;
  stamina = 2;          // brukes på moves og angrep/spells
  mana = 10;            // magisk kraft tilgjengelig til spells
  /**
   * @param {any} x
   * @param {any} y
   */
  constructor(x, y) {
    super(x, y);
    const div = document.createElement("div");
    div.id = "avatar";
    this.div = /** @type {HTMLElement} */ (div);
  }

  // hver turn regenereres stamina og mana
  recover() {
    this.regen("stamina",1);
    this.regen("mana",1);
  }

  render() {
    let { x, y } = this;
    let ix = clamp(x - 5, 0, 80 - 11);
    let iy = clamp(y - 5, 0, 80 - 11);
    if (ix === 69) {
      x = x - 69;
    } else {
      x = clamp(x, 0, 5);
    }
    if (iy === 69) {
      y = y - 69;
    } else {
      y = clamp(y, 0, 5);
    }
    this.div.style.left = x * 32 + "px";
    this.div.style.top = y * 32 + "px";
  }

  canWalk(t) {
    return "34567".includes(t) || t & T.ROAD;
  }

  move(dx, dy) {
    this.x = (this.x +dx + B.w) % B.w;
    this.y = (this.y +dy + B.h) % B.h;
  }



  /**
   * @param {{dx:number,dy:number}} delta 
   * @param {import("./Terrain.js").Map} map
   */
  action(delta, map) {
    const { x, y } = this;
    const {dx,dy} = delta;
    
    if (dx || dy) {
      const newx = (x +dx + B.w) % B.w;
      const newy = (y +dy + B.h) % B.h;
      const t = String(map.fetch(newx, newy));
      if (this.canWalk(t)) {
        map.clear(x, y)
        this.move(dx, dy);
        map.place(Thing.MONSTER, newx, newy);
      }
    }
  }

}

export { Monster, Actor , Thing, Stats };
