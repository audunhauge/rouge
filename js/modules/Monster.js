// @ts-check
 
import { clamp, dice } from "./util.js";

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
  render(center) {
    // don't render if not on board
    const x = clamp(center.x, 0, 80 - 11);
    const y = clamp(center.y, 0, 80 - 11);
    if (!this.onboard({x,y})) {
      this.div.style.opacity = "0";
      return;
    }
    this.div.style.opacity = "1";
    this.div.style.left = (this.x - center.x) * 32 + "px";
    this.div.style.top = (this.y - center.y) * 32 + "px";
  }
  /**
   * Returns true if this an point are on same board
   * @param {{x:number,y:number}} point 
   */
  onboard(point) {
    const { x, y } = this;
    return x >= point.x && x < point.x+12 &&
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
  move() {
    this.x = clamp(this.x + dice(3) - 2, 0, 79);
    this.y = clamp(this.y + dice(3) - 2, 0, 79);
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
    if (x > 75) {
      x = 5 + x - 75;
    } else {
      x = clamp(x, 0, 5);
    }
    if (y > 75) {
      y = 5 + y - 75;
    } else {
      y = clamp(y, 0, 5);
    }
    this.div.style.left = x * 32 + "px";
    this.div.style.top = y * 32 + "px";
  }
}

export { Monster, Player };
