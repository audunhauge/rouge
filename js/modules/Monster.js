// @ts-check

import { clamp, dice } from "./util.js";
import { Map } from "./Terrain.js";

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
    return "12".includes(t);
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
      const t = String(map.fetch(x + dx, y + dy));
      if (this.canWalk(t)) {
        map.clear(x, y)
        this.move(dx, dy);
        map.place(Thing.MONSTER, x + dx, y + dy);
      }
    }
  }
}

class Player extends Actor {
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
    return "123".includes(t);
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * @param {string} key
   * @param {import("./Terrain.js").Map} map
   */
  action(key, map) {
    const { x, y } = this;
    let dx = 0; let dy = 0;
    switch (key) {
      case "ArrowLeft":
        dx = -1;
        break;
      case "ArrowRight":
        dx = 1;
        break;
      case "ArrowUp":
        dy = -1;
        break;
      case "ArrowDown":
        dy = 1;
        break;
    }
    if (dx || dy) {
      const t = String(map.fetch(x + dx, y + dy));
      if (this.canWalk(t)) {
        map.clear(x, y)
        this.move(dx, dy);
        map.place(Thing.MONSTER, x + dx, y + dy);
      }
    }
  }

}

export { Monster, Player };
